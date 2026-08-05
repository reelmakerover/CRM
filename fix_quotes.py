import os

files_to_fix = [
    "/Users/yashsaini/Downloads/ds-education/client/src/pages/HomePage.js",
    "/Users/yashsaini/Downloads/ds-education/client/src/pages/admin/AdminSettings.js",
    "/Users/yashsaini/Downloads/ds-education/client/src/pages/admin/AdminNotifications.js",
    "/Users/yashsaini/Downloads/ds-education/client/src/pages/ResultsPage.js",
    "/Users/yashsaini/Downloads/ds-education/server/utils/seed.js"
]

for path in files_to_fix:
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Replace unescaped D's Education inside single quotes with escaped one
        # This is a simple regex replace or string replace
        # We know exactly where the issues are:
        
        # HomePage.js
        content = content.replace("'10,000+ families trust D's Education for their children\\'s future'", "'10,000+ families trust D\\'s Education for their children\\'s future'")
        content = content.replace("thanks to D's Education\\'s", "thanks to D\\'s Education\\'s")
        
        # AdminSettings.js
        content = content.replace("'Test Email from D's Education'", "'Test Email from D\\'s Education'")
        content = content.replace("'D's Education ERP v1.0'", "'D\\'s Education ERP v1.0'")
        
        # AdminNotifications.js
        content = content.replace("D's Education portal.", "D\\'s Education portal.")
        content = content.replace("D's Education Team'", "D\\'s Education Team'")
        content = content.replace("at D's Education.", "at D\\'s Education.")
        content = content.replace("\\nD's Education'", "\\nD\\'s Education'")
        content = content.replace("— D's Education'", "— D\\'s Education'")
        content = content.replace("from D's Education\"", "from D's Education\"") # this is inside double quotes, it's fine.
        
        # ResultsPage.js
        content = content.replace("testimonial: 'D's Education", "testimonial: 'D\\'s Education")
        
        # seed.js
        content = content.replace("testimonial: 'D's Education", "testimonial: 'D\\'s Education")

        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Fixed {path}")
