# Setup 
1. 
```bash
conda create -n golden-backend python=3.10 -y
conda activate golden-backend
```

2. 
```bash
pip install -r requirements.txt
```

3. Download folder Data từ https://drive.google.com/drive/folders/1dUPtycEUNw-i5STDmhRyPoStUPI-lUUM?usp=sharing

4. Unzip folder đã tải xuống. Trong Backend/app/core/config.py, chỉnh DATA_PATH phù hợp. Ví dụ như ở máy em thì DATA_PATH là 'D:/AIC2025/Data'

5. Run 
```bash
cd Backend
uvicorn app.main:app
```

6. Test
```bash
python Backend/test/test.py
```

# Note cho Frontend