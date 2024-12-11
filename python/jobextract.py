import pydparser as dp

data = dp.JdParser('jd.pdf', None, None).get_extracted_data()

print(data)