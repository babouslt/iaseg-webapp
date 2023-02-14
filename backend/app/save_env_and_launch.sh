pip freeze > /code/vol/all_requirements.txt
wget https://raw.githubusercontent.com/pytorch/pytorch/master/torch/utils/collect_env.py
python collect_env.py > /code/vol/env.txt
uvicorn app.main:app --host 0.0.0.0 --port 80