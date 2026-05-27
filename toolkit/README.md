# Toolkit Image Cleaner

Drop source images into `raw-img/`, then run:

```bash
python3 clear_gray_space.py
```

Cleaned transparent PNGs are written to `finished-img/`.

To write an SVG wrapper around the cleaned transparent image:

```bash
python3 clear_gray_space.py --format svg
```

Use `--format both` to create both files.

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

For very dark checkerboards, lower it further:

```bash
python3 clear_gray_space.py --force --min-lightness 150
```

If small edge-connected pockets remain, add another cleanup pass:

```bash
python3 clear_gray_space.py --force --extra-passes 2
```

For black-outline text logos with checkerboard trapped between letters:

```bash
python3 clear_gray_space.py --force --checker-component-cleanup
```
