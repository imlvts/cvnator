OUTPUT=_site
all:
	mkdir -p $(OUTPUT)
	cp cv.json $(OUTPUT)/
	# What do you MEAN you use the C preprocessor for web dev?
	cpp -E -P index.in.html > $(OUTPUT)/index.html
