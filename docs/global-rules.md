

# 🧱 Code Structure & Modularity
- **Never create a file longer than 500 lines of code.** Refactor into modules or helpers when needed.  
- **Organize code by feature or responsibility**, separating components, stores, services, and utilities clearly.  
- **Follow Tailwind conventions for CSS**: use utility-first classes in components; avoid inline `<style>` blocks unless necessary.  
- **always read file** data_structure.md  for database schema and relationships before creating services or data access layers.
- **Directory guidance** (example for webapp):  
/app
/app/features/components 
/components
/stores # state management
/utils
/app/globals



# 🧠 AI Behavior Rules
- **Never assume missing context. Ask questions if uncertain.**  
- **Never hallucinate libraries, components, or functions** – only use verified packages for Nextjs + Supabase + Tailwind.  
- **Confirm file paths and module names exist** before referencing them.  
- **Follow project styling conventions** in all generated code (Tailwind classes, component patterns, consistent naming).  
- **When generating files**, respect modular boundaries: separate components, pages, services, styles, and tests appropriately.