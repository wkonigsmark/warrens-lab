# Toolkit Image Cleaner

Drop source images into `raw-img/`, then run:

```bash
python3 clear_gray_space.py
```

Cleaned transparent PNGs are written to `finished-img/`.

Useful options:

```bash
python3 clear_gray_space.py --force
python3 clear_gray_space.py --watch
python3 clear_gray_space.py --crop
```

If a darker gray background remains, lower the lightness threshold:

```bash
python3 clear_gray_space.py --force --min-lightness 185
```

If small edge-connected pockets remain, add another cleanup pass:

```bash
python3 clear_gray_space.py --force --extra-passes 2
```
