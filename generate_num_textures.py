from PIL import Image, ImageDraw, ImageFont

# Create a function to generate the textures
def create_number_texture(number, filename):
    # Create an image with a white background
    img = Image.new('RGBA', (100, 300), color = (255, 255, 255, 0))
    d = ImageDraw.Draw(img)

    # Load a font
    try:
        # If you have a specific font file you want to use
        font = ImageFont.truetype("arial.ttf", 70)
    except IOError:
        # Default font
        font = ImageFont.load_default(70)

    # Calculate the bounding box of the text to center it
    text = str(number)
    bbox = d.textbbox((0, 0), text, font=font)
    text_width, text_height = bbox[2] - bbox[0], bbox[3] - bbox[1]
    text_x = (img.width - text_width) / 2
    text_y = (img.height - text_height) / 2

    # Draw the number on the image
    d.text((text_x, text_y), text, fill=(0, 0, 0), font=font)

    # Save the image
    img.save(filename)

# Generate textures for numbers 1 to 12
for i in range(1, 13):
    create_number_texture(i, f'number-{i}.png')
