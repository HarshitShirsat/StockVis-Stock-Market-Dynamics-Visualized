import pandas as pd
from sklearn.manifold import TSNE
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import seaborn as sns
from flask import Flask, render_template, request, jsonify
import pprint
from flask_cors import CORS
from flask_cors import cross_origin

#Instantiate Flask web app
app = Flask(__name__)
CORS(
        app,
        origins = "*",
        supports_credentials=True,
        methods=['GET', 'POST']
    )
#Render d3 html from template folder 
def tsne():
        return render_template("frontend-ext.html")

#Instantiate data frame to hold financial data
finance_data = pd.DataFrame()
# Render home page at http:127.0.0.1:5000/
@app.route("/")
def hello():
    return render_template("cse578-project-ext-homepage.html")

#Render initial page at default http:127.0.0.1:5000/tsne
#During debugging - this will show 'tsne' rather than frontend-ext.html
@app.route("/tsne")
def tsne():
      return render_template("frontend-ext.html")

@app.route("/build-table-finance-data", methods=['GET', 'POST'])
def build_table_finance_data():
      print('##### build-table-finance-data ####')
      global finance_data
      if finance_data.empty:
            #finance_data = pd.read_csv('industrywise_pe_mc.csv')
            finance_data = pd.read_csv('df_2022.csv')
            finance_data = finance_data.reset_index()
      finance_json = finance_data.to_json(orient="records")
      # 8. Send json in http response to original http request.
      return finance_json

'''
    The tsne model is built in multiple steps:
    1. Import data from csv into dataframe.
    2. Handle http request from front-end-ext.html
        a. Identify selected features from front-end-ext.html.
        b. Append feature data to features list
    3. Filter data frame with features list and save to data output.
    4. Scale filtered data.
    5. Build tsne model with scaled data.
    6. Obtain data output from tsne model and save to results data frame.
    7. Transform results dataframe to json.
    8. Send json in http response to original http request.
'''
@app.route("/build-tsne-model-data", methods=['GET', 'POST'])
def build_tsne_model_data():
    print('*******************  build_tsne_model_data()**************')
    #1. Import data from csv into dataframe.
    global finance_data
    if finance_data.empty:
          #finance_data = pd.read_csv('industrywise_pe_mc.csv')
          finance_data = pd.read_csv('df_2022.csv')
          finance_data = finance_data.reset_index()
    # 2. Handle http request from front-end-ext.html
    #     a. Identify selected features from front-end-ext.html.
    #     b. Append feature data to features list
    print('finance_data columns: ', finance_data.columns.tolist())
    params = request.get_json()
    print('printing params=request.get_json()')
    pprint.pprint(params, compact=True)
    features = []
    #Market cap,MC_Change,P/E ratio,PE_Change 
    #feat_vals = ['Market Cap', 'MC_Change', 'P/E Ratio', 'PE_Change']
    
    if params['Market_Cap_Checked']:
          features.append('Market cap')
    if params['MC_Change_Checked']:
          features.append('MC_Change')
    if params['PE_Ratio_Checked']:
          features.append('P/E Ratio')
    if params['PE_Change_Checked']:
          features.append('PE_Change')
    # 3. Filter data frame with features list and save to data output.
    # TO DO - fix this with application.py lines 97-113 or so - the filtering
    # is incomplete in my code.  I think you should only use the checked
    # features in the json request body and apply that to the model to rebuild.
    # The snippet below does not rebuild.  Review tSNE just to make sure.
    #raw_finance_data = finance_data[features].values
    # 3a. Transform string values into float using 'get_float(x)' function
    filtered_finance_data = pd.DataFrame()
    #filtered_finance_data['Year'] = raw_finance_data['Year'].apply(get_float)
    if 'Market cap' in features:
        print('Data frame filter includes Market cap')
        filtered_finance_data['Market cap'] = finance_data['Market cap'].apply(get_float)
    if 'MC_Change' in features:
        print('Data frame filter includes MC_Change')
        filtered_finance_data['MC_Change'] = finance_data['MC_Change'].apply(get_float)
    if 'P/E Ratio' in features:
        print('Data frame filter includes P/E Ratio')
        filtered_finance_data['P/E Ratio'] = finance_data['P/E ratio'].apply(get_float)
    if 'PE_Change' in features:
        print('Data frame filter includes PE_Change')
        filtered_finance_data['PE_Change'] = finance_data['PE_Change'].apply(get_float)
    print('filtered_finance_data.head(5) - this should match the checked boxes in UI...')
    print(filtered_finance_data.head(5))
    # 4. Scale filtered data.
    scaled_finance_data = StandardScaler().fit_transform(filtered_finance_data)
    # 5. Build tsne model with scaled data.
    print('Fitting tsne model with scaled_finance_data...')
    tsne = TSNE(n_components=2, n_iter=1000, random_state=42)
    points = tsne.fit_transform(scaled_finance_data)
    # 6. Obtain data output from tsne model and save to results data frame.
    print('Building dataframe for x and y points...')
    points_df = pd.DataFrame(points, columns=["x", "y"])
    # Concatentate data to origina data frame with imported csv file.  This is
    # necessary to map the color to the name of the company.
    print('Concatenating dataframes to merge points with raw finance_data')
    results = pd.concat([finance_data, points_df], axis=1)
    # 7. Transform results dataframe to json.
    finance_json = results.to_json(orient="records")
    pprint.pprint('finance_json returned to d3 html page ...')
    pprint.pprint(finance_json)
    # 8. Send json in http response to original http request.
    return finance_json

def get_float(x):
    x2 = str(x).strip('%')
    x3 = str(x2).strip('$')
    x4 = str(x3).strip(' B')
    x5 = str(x4).strip(' M')
    x6 = str(x5).strip('< ')
    f = float(x6)
    return f

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001)
    #CORS(app, resources={r"/*": {"origins": "*"}})
    CORS(
            app,
            origins = "*",
            supports_credentials=True,
            methods=['GET', 'POST']
        )
    