const editor = document.getElementById('editor');
        const preview = document.getElementById('preview');
        const lineNumbers = document.getElementById('line-numbers');
        const slider = document.getElementById('slider');
        const editorPane = document.querySelector('.editor-pane');
        const previewPane = document.querySelector('.preview-pane');

        // Mobile menu toggle
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navMenu = document.querySelector('.nav-menu');

        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Dropdown toggle for mobile
        const dropdowns = document.querySelectorAll('.dropdown');

        dropdowns.forEach(dropdown => {
            dropdown.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        });
        
        marked.setOptions({
            breaks: true, 
            gfm: true, 
            tables: true,
            highlight: function(code, lang) {
              return hljs.highlightAuto(code, [lang]).value;
            }
          });

        // Markdown editor functionality
        function updatePreview() {
            const markdown = editor.value; 
            const html = marked.parse(markdown); 
            preview.innerHTML = html; 
        
            
            const codeBlocks = preview.querySelectorAll('pre code');
            codeBlocks.forEach(block => {
                hljs.highlightElement(block); 
            });
        
            updateLineNumbers(); 
        }
        

        function updateLineNumbers() {
            const lines = editor.value.split('\n');
            lineNumbers.innerHTML = lines.map((_, index) => index + 1).join('<br>');
        }
        
       
        marked.setOptions({
            breaks: true, 
            gfm: true, 
            tables: true, 
            highlight: function(code, lang) {
                return hljs.highlightAuto(code, [lang]).value; 
            }
        });
        
        // Update preview and line numbers on input
        editor.addEventListener('input', updatePreview);
        editor.addEventListener('scroll', () => {
            lineNumbers.scrollTop = editor.scrollTop;
        });
        
        // Initial content for testing
        editor.value = `# Welcome to the Markdown Editor
        
This is a simple markdown editor with live preview.

## Features

- Live preview
- Line numbers
- Syntax highlighting
- Tables

| Syntax      | Description |
| ----------- | ----------- |
| Header      | Title       |
| Paragraph   | Text        |

### Code Example

\`\`\`javascript
function greet(name) {
    console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

Enjoy writing your markdown!
        `;
        
        
        updatePreview();


// Function to download a file
function downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// Export as HTML
document.getElementById('export-html').addEventListener('click', () => {
    const markdown = editor.value;
    const htmlContent = marked.parse(markdown);
    downloadFile('document.html', htmlContent, 'text/html');
});

// Export as PDF
document.getElementById('export-pdf').addEventListener('click', () => {
    const element = document.getElementById('preview');
    const opt = {
        margin: 1,
        filename: 'document.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
});


// Export as Word
document.getElementById('export-word').addEventListener('click', () => {
    const markdown = editor.value;
    const htmlContent = marked.parse(markdown);


    const wordContent = `
        <html xmlns:v="urn:schemas-microsoft-com:vml"
              xmlns:o="urn:schemas-microsoft-com:office:office"
              xmlns:w="urn:schemas-microsoft-com:office:word"
              xmlns:m="http://schemas.microsoft.com/office/2004/12/omml"
              xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"><title>Document</title></head>
        <body>${htmlContent}</body></html>
    `;
    downloadFile('document.doc', wordContent, 'application/msword');
});

document.getElementById('import-md').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            document.getElementById('editor').value = content;
            updatePreview();  
        };
        reader.readAsText(file);
    }
});




// Function to open a document
function openDocument(docId) {
    // Deselect all buttons
    const buttons = document.querySelectorAll('.document-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Highlight the selected document button
    const selectedButton = buttons[docId - 1];
    selectedButton.classList.add('active');

    // Load document content based on docId (for now, just a placeholder)
    const editor = document.getElementById('editor');
    if (docId === 1) {
        editor.value = "Document 1 content here...";
    } else if (docId === 2) {
        editor.value = "Document 2 content here...";
    }

    // Update the preview
    updatePreview();
}

