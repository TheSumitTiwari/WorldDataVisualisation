import dash
from dash import dcc, html
from dash.dependencies import Input, Output
import plotly.graph_objs as go
import pandas as pd

# Sample data with city name, latitude, longitude, and count
data = pd.DataFrame({
    'city': ['CityA', 'CityB', 'CityC', 'CityD', 'CityE'],
    'lat': [34.0522, 51.5074, -33.8688, 35.6895, -23.5505],
    'lon': [-118.2437, -0.1278, 151.2093, 139.6917, -46.6333],
    'count': [120, 75, 45, 150, 90]
})

app = dash.Dash(__name__)

app.layout = html.Div(style={'height': '100vh'}, children=[
    dcc.Graph(id='world-map', style={'height': '100%', 'width': '100%'})
])

@app.callback(
    Output('world-map', 'figure'),
    Input('world-map', 'relayoutData')  # Placeholder for any interactive feature
)
def update_map(_):
    fig = go.Figure()

    fig.add_trace(go.Scattergeo(
        lon=data['lon'],
        lat=data['lat'],
        text=data.apply(lambda row: f"City: {row['city']}<br>Lat: {row['lat']}<br>Lon: {row['lon']}<br>Count: {row['count']}", axis=1),
        mode='markers',
        marker=dict(
            size=12,
            color='darkred',  # Set all markers to deep red
            opacity=0.8,
            line=dict(width=1, color='black')
        ),
        hoverinfo='text'
    ))

    fig.update_geos(
        projection_type="natural earth",
        showcountries=True,
        countrycolor="black",
        showcoastlines=True,
        coastlinecolor="gray",
        showland=True,
        landcolor="lavender",
        showlakes=True,
        lakecolor="lightblue",
        showrivers=True,
        rivercolor="blue",
        showocean=True,
        oceancolor="lightcyan",
        showframe=False,
        resolution=50,  # Higher resolution for better detail
        lonaxis=dict(showgrid=True, gridcolor='lightgray'),
        lataxis=dict(showgrid=True, gridcolor='lightgray')
    )

    fig.update_layout(
        title_text="World Map with Deep Red City Markers",
        title_x=0.5,
        margin={"r": 0, "t": 0, "l": 0, "b": 0},
        geo=dict(
            projection_scale=1.3,  # Simulates zoom
            center=dict(lat=20, lon=0),  # Sets initial center
        ),
        uirevision='constant'  # Keeps zoom and color consistent on updates
    )

    return fig

if __name__ == '__main__':
    app.run_server(debug=True)
