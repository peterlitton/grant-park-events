#!/usr/bin/env python3
"""
Build Metrics Chart Generator
Grant Park Events Project

Generates interactive dual Y-axis chart showing:
- Daily development time (bars)
- Cumulative development time (line)

Usage:
    python3 generate-chart.py
    
Output:
    ./build-metrics-chart.html (interactive HTML chart)
"""

import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from datetime import datetime
import os

# Get script directory
script_dir = os.path.dirname(os.path.abspath(__file__))

# Read the data from same directory
csv_path = os.path.join(script_dir, 'build-metrics-raw.csv')
df = pd.read_csv(csv_path)

# Convert date column to datetime
df['Date'] = pd.to_datetime(df['Date'])

# Parse development time (remove tilde if present)
df['Minutes'] = df['Development Time (minutes)'].astype(str).str.replace('~', '').astype(float)

# Group by date and sum minutes
daily_totals = df.groupby('Date')['Minutes'].sum().reset_index()
daily_totals.columns = ['Date', 'Total_Minutes']

# Convert to hours
daily_totals['Total_Hours'] = daily_totals['Total_Minutes'] / 60

# Calculate cumulative hours
daily_totals['Cumulative_Hours'] = daily_totals['Total_Hours'].cumsum()

# Create figure with secondary y-axis
fig = make_subplots(specs=[[{"secondary_y": True}]])

# Add bar chart for daily development time
fig.add_trace(
    go.Bar(
        x=daily_totals['Date'],
        y=daily_totals['Total_Hours'],
        name="Daily Development Time",
        marker_color='rgb(55, 83, 109)',
        hovertemplate='<b>%{x|%b %d}</b><br>Daily: %{y:.1f} hours<extra></extra>'
    ),
    secondary_y=False,
)

# Add line chart for cumulative time
fig.add_trace(
    go.Scatter(
        x=daily_totals['Date'],
        y=daily_totals['Cumulative_Hours'],
        name="Cumulative Development Time",
        mode='lines+markers',
        line=dict(color='rgb(255, 127, 14)', width=3),
        marker=dict(size=8),
        hovertemplate='<b>%{x|%b %d}</b><br>Cumulative: %{y:.1f} hours<extra></extra>'
    ),
    secondary_y=True,
)

# Update layout
fig.update_layout(
    title={
        'text': 'Grant Park Events - Development Time Analysis',
        'x': 0.5,
        'xanchor': 'center',
        'font': {'size': 24, 'color': '#333'}
    },
    hovermode='x unified',
    plot_bgcolor='white',
    paper_bgcolor='white',
    font=dict(size=12),
    legend=dict(
        orientation="h",
        yanchor="bottom",
        y=1.02,
        xanchor="right",
        x=1
    ),
    width=1400,
    height=700,
    margin=dict(l=80, r=80, t=100, b=80)
)

# Set x-axis title
fig.update_xaxes(
    title_text="Date",
    showgrid=True,
    gridwidth=1,
    gridcolor='LightGray',
    tickformat='%b %d',
    dtick=86400000.0  # 1 day in milliseconds
)

# Set y-axes titles
fig.update_yaxes(
    title_text="<b>Daily Development Time (hours)</b>",
    secondary_y=False,
    showgrid=True,
    gridwidth=1,
    gridcolor='LightGray',
    rangemode='tozero'
)

fig.update_yaxes(
    title_text="<b>Cumulative Development Time (hours)</b>",
    secondary_y=True,
    showgrid=False,
    rangemode='tozero'
)

# Save as HTML in same directory
output_path = os.path.join(script_dir, 'build-metrics-chart.html')
fig.write_html(output_path)

# Print summary
print(f"✅ Chart generated successfully!")
print(f"📊 Output: {output_path}")
print(f"\n📈 Summary Statistics:")
print(f"   Total Days: {len(daily_totals)}")
print(f"   Total Builds: {len(df)}")
print(f"   Total Development Time: {daily_totals['Cumulative_Hours'].iloc[-1]:.1f} hours")
print(f"   Average per Day: {daily_totals['Total_Hours'].mean():.1f} hours")
print(f"   Average per Build: {(daily_totals['Total_Minutes'].sum() / len(df)):.1f} minutes")
print(f"\n📅 Latest Build: {df['Date'].max().strftime('%B %d, %Y')}")
print(f"🔢 Latest Build Number: {df['Build'].iloc[-1]}")
