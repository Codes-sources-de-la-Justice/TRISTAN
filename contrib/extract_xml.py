#!/usr/bin/env python3
import PyPDF2
import sys

def extract_xml(pdf):
    catalog = pdf.trailer['/Root']
    embedded_files = catalog['/Names']['/EmbeddedFiles']['/Names']

    if 'Données' in embedded_files[0]:
        soup = embedded_files[1].getObject()

        return soup['/EF']['/F'].getData()

    return None

def usage():
    print('extract_xml.py <input_file>')
    print('writes to stdout the XML file embedded')

def main():
    if len(sys.argv) < 2:
        usage()
        sys.exit(1)

    input_file = sys.argv[1]

    with open(input_file, 'rb') as pdf_file:
        xml_data = extract_xml(PyPDF2.PdfFileReader(pdf_file))
        if xml_data:
            sys.stdout.write(xml_data.decode('utf8'))
        else:
            print('[!] No XML found')


if __name__ == '__main__':
    main()
