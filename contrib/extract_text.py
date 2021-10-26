#!/usr/bin/env python3
import pdftotext
import sys

def extract_text(pdf):
    return "\n\n".join(pdf)
    
def usage():
    print('extract_text.py <input_file>')
    print('writes to stdout the text in the PDF')

def main():
    if len(sys.argv) < 2:
        usage()
        sys.exit(1)

    input_file = sys.argv[1]

    with open(input_file, 'rb') as pdf_file:
        text_data = extract_text(pdftotext.PDF(pdf_file))
        if text_data:
            sys.stdout.write(text_data)
        else:
            print('[!] No text found')


if __name__ == '__main__':
    main()
