INSERT INTO about_links (label, url, sort_order)
SELECT 'Instagram', 'https://www.instagram.com/', 1
WHERE NOT EXISTS (SELECT 1 FROM about_links WHERE LOWER(label) = 'instagram');

INSERT INTO about_links (label, url, sort_order)
SELECT 'X', 'https://x.com/home', 2
WHERE NOT EXISTS (SELECT 1 FROM about_links WHERE LOWER(label) = 'x');

INSERT INTO about_links (label, url, sort_order)
SELECT 'LinkedIn', 'https://www.linkedin.com/in/westin-perry-2a9750285/', 3
WHERE NOT EXISTS (SELECT 1 FROM about_links WHERE LOWER(label) = 'linkedin');
