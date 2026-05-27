import sys

with open("/etc/nginx/conf.d/tuteng3.site.conf", "r") as f:
    lines = f.readlines()

block = open("/tmp/xinghe-nginx-block.conf").read()

# Insert before line 166 (idx 165) and line 338 (idx 337)
# Reverse order so earlier indices stay valid
for idx in sorted([164, 337], reverse=True):
    lines.insert(idx, block)

with open("/etc/nginx/conf.d/tuteng3.site.conf", "w") as f:
    f.writelines(lines)

print("done")
