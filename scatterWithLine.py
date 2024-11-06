from dash import dcc, html, callback, Input, Output
import plotly.graph_objects as go
import pandas as pd
import dash_bootstrap_components as dbc

# Sample data
data = {
    'x': [1, 2, 3, 4, 5],
    'y': [10, 15, 13, 17, 9],
    'z': [5, 6, 7, 8, 4],
    'label': ['A', 'B', 'C', 'D', 'E']
}
df = pd.DataFrame(data)

# Function to create a 3D scatter plot with vertical lines to the Z-axis
def create_scatter_plot_with_lines(data, title):
    # Scatter plot trace for the nodes
    scatter_trace = go.Scatter3d(
        x=data['x'],
        y=data['y'],
        z=data['z'],
        mode='markers',
        marker=dict(size=5, color=data['z'], colorscale='Viridis'),
        text=data['label'],
        hovertemplate="Label: %{text}<br>X: %{x}<br>Y: %{y}<br>Z: %{z}<extra></extra>"
    )

    # Create a line trace for each point to connect it to the Z-axis
    line_traces = []
    for i in range(len(data)):
        line_trace = go.Scatter3d(
            x=[data['x'].iloc[i], data['x'].iloc[i]],
            y=[data['y'].iloc[i], data['y'].iloc[i]],
            z=[0, data['z'].iloc[i]],  # Line from z=0 to the point's z value
            mode='lines',
            line=dict(color='gray', width=2),
            showlegend=False
        )
        line_traces.append(line_trace)

    # Combine the scatter plot trace with all the line traces
    fig = go.Figure(data=[scatter_trace] + line_traces)
    fig.update_layout(
        title=title,
        margin=dict(l=0, r=0, t=30, b=0),
        scene=dict(zaxis_title='Z Axis')
    )
    return dcc.Graph(figure=fig, style={'height': '400px'})

# Layout with a single scatter plot
layout = dbc.Container(fluid=True, children=[
    html.H2("3D Scatter Plot with Lines to Z-axis"),
    create_scatter_plot_with_lines(df, "3D Scatter with Z-Axis Lines")
])
