path = r'C:\Users\Keshav Bhardwaj\.gemini\antigravity\scratch\real-estate-system\src\components\auth\AuthModal.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove admin option from role dropdown, rename label
old_label = 'Role Permission'
old_admin_opt = '<option value="admin">Admin (All privileges + Dashboard)</option>\n'
old_agent_opt = '                    <option value="agent">Agent (Manage assigned listings &amp; bookings)</option>'
old_customer_opt = '                    <option value="customer">Customer (Browse &amp; schedule viewings)</option>'

# Step 1: rename label
content = content.replace('>Role Permission<', '>Role<')

# Step 2: remove admin option line
# Find and remove the admin option
admin_line = '                    <option value="admin">Admin (All privileges + Dashboard)</option>\n'
if admin_line in content:
    content = content.replace(admin_line, '')
    print('Admin option removed')
else:
    print('Admin option NOT found by exact match - trying partial')
    idx = content.find('value="admin"')
    if idx >= 0:
        # find start of line
        start = content.rfind('\n', 0, idx) + 1
        end = content.find('\n', idx) + 1
        print(f'Found: {repr(content[start:end])}')
        content = content[:start] + content[end:]
        print('Admin option removed via partial match')
    else:
        print('Admin option not found at all')

# Step 3: Reorder - customer before agent
# After removal, check order
if 'value="customer"' in content and 'value="agent"' in content:
    idx_c = content.find('value="customer"')
    idx_a = content.find('value="agent"')
    if idx_a < idx_c:
        # agent comes before customer - need to swap
        agent_start = content.rfind('\n', 0, idx_a) + 1
        agent_end = content.find('\n', idx_a) + 1
        agent_line = content[agent_start:agent_end]
        
        customer_start = content.rfind('\n', 0, idx_c) + 1
        customer_end = content.find('\n', idx_c) + 1
        customer_line = content[customer_start:customer_end]
        
        content = content[:agent_start] + customer_line + content[agent_end:customer_start] + agent_line + content[customer_end:]
        print('Reordered: customer before agent')
    else:
        print('Order already correct: customer before agent')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
