import torch
from pointe.point_e.util.pc_to_mesh import marching_cubes_mesh
from pointe.point_e.models.download import load_checkpoint
from pointe.point_e.models.configs import MODEL_CONFIGS, model_from_config

def generator3D(pc):
    print('creating SDF model...')
    name = 'sdf'
    device = 'cuda' if torch.cuda.is_available() else "cpu"
    print("using device is", device)
    model = model_from_config(MODEL_CONFIGS[name], device)
    model.eval()

    print('loading SDF model...')
    model.load_state_dict(load_checkpoint(name, device))

    # Produce a mesh (with vertex colors)
    mesh = marching_cubes_mesh(
      pc=pc,
      model=model,
      batch_size=4096,
      grid_size=32, # increase to 128 for resolution used in evals
      progress=True,
    )

    return mesh

