from django.http import JsonResponse
from django.shortcuts import render
from pointe.point_e.util.plotting import plot_point_cloud
from tqdm.auto import tqdm
from myapp.ai3d.text2pointGenerator import generate_pointcloud as generate_pointcloud


def generate_3d_model_view(request):
    if request.method == 'POST':
        user_input = request.POST.get('user_input', '')


        fig = plot_point_cloud(pc, grid_size=3, fixed_bounds=((-0.75, -0.75, -0.75), (0.75, 0.75, 0.75)))

        # Depending on your actual result, you might need to customize this part.
        # You need to determine what you want to return as the result.

        fig_plotly = go.Figure(
            data=[
                go.Scatter3d(
                    x=pc.coords[:, 0], y=pc.coords[:, 1], z=pc.coords[:, 2],
                    mode='markers',
                    marker=dict(
                        size=2,
                        color=['rgb({},{},{})'.format(r, g, b) for r, g, b in
                               zip(pc.channels["R"], pc.channels["G"], pc.channels["B"])],
                    )
                )
            ],
            layout=dict(
                scene=dict(
                    xaxis=dict(visible=False),
                    yaxis=dict(visible=False),
                    zaxis=dict(visible=False)
                )
            ),
        )
        result = {
            'model_url': 'path/to/your/generated/model.obj',  # Modify this to return the actual model URL
            'message': 'Model generation successful',  # Add any messages you want to return
        }

        return JsonResponse(result)

    return render(request, 'index-3d.html')
