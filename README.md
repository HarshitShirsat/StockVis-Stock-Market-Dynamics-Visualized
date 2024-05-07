# StockVis-Stock-Market-Dynamics-Visualized
StockVis leverages state-of-the-art data visualization technologies to simplify the complexities of financial market dynamics, such as market capitalization and stock price fluctuations, providing a decade-long perspective on market trends.

The frontend app can be viewed using any simple http.server. We have used the Live server extension from Microsoft, available in VSCode itself. The v7 extension uses a python application in Flask to build a model for t-SNE using sklearn.  The python libraries
are defined in requirements.txt.  Please execute the following commands before running the frontend app:

1. `pip install -r requirements.txt`
2. `flask --app application.py run --port 8001`