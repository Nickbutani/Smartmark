document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const preview = document.getElementById('preview-area');
    const documentList = document.getElementById('document-list');
    const exportPDF = document.getElementById('export-pdf');
    const exportHTML = document.getElementById('export-html');
    const downloadMD = document.getElementById('download-md');
    const newDocument = document.getElementById('new-document');
    const fullscreenEditorBtn = document.getElementById('fullscreen-editor');
    const fullscreenPreviewBtn = document.getElementById('fullscreen-preview');
    const editorSection = document.querySelector('.editor');
    const previewSection = document.querySelector('.preview');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const dropdowns = document.querySelectorAll('.dropdown');
    const newDocumentModal = document.getElementById('new-document-modal');
    const modal = document.getElementById('new-document-modal');
    const closeModalButton = document.getElementById('close-modal');
    const createButton = document.getElementById('create-document-button');
    const documentNameInput = document.getElementById('document-name');
    const importMD = document.getElementById('import-md');
    const introMessage = document.getElementById("intro-message");
    const navbar = document.querySelector('.navbar');
    const mainContent = document.querySelector('.main-content');
    const documentBtn = document.getElementById('document-btn');
    const documentIconSymbol = document.getElementById('document-icon-symbol');
    const deleteIcon = document.getElementById('delete-document');
    const documentNameText = document.getElementById('document-name-text');
    const documentNameInputEditable = document.getElementById('document-name-input');
    let currentDocumentName = '';
    let documents = JSON.parse(localStorage.getItem('documents')) || [];
    let currentDocument = null;
    let aceEditor;

    documentNameText.textContent = currentDocumentName;
    documentNameInputEditable.value = currentDocumentName;

    documentNameText.addEventListener('click', () => {
        documentNameText.style.display = 'none';
        documentNameInputEditable.style.display = 'inline-block';
        documentNameInputEditable.focus();
    });

    const saveDocumentNameEditable = () => {
        const newDocumentName = documentNameInputEditable.value.trim();
        if (newDocumentName !== '') {
            documentNameText.textContent = newDocumentName;
            if (currentDocument) {
                currentDocument.title = newDocumentName;
                updateDocumentList();
                saveDocuments();
            }
        } else {
            documentNameText.textContent = currentDocument.title;
        }
        documentNameText.style.display = 'inline-block';
        documentNameInputEditable.style.display = 'none';
    };

    const isFirstVisit = localStorage.getItem('firstVisit') !== 'false';
    if (isFirstVisit) {
        introMessage.style.display = 'flex';
        setTimeout(() => {
            introMessage.classList.add('fade-out');
            setTimeout(() => {
                introMessage.style.display = 'none';
                navbar.style.display = 'flex';
                mainContent.style.display = 'flex';
            }, 1000);
        }, 2000);
        localStorage.setItem('firstVisit', 'false');
    } else {
        introMessage.style.display = 'none';
        navbar.style.display = 'flex';
        mainContent.style.display = 'flex';
    }

    async function fetchIntroMarkdown() {
        const response = await fetch('intro.md');
        if (!response.ok) {
            throw new Error('Could not fetch the introductory markdown');
        }
        return await response.text();
    }

    aceEditor = ace.edit('editor');
    aceEditor.setTheme('ace/theme/chrome');
    aceEditor.session.setMode('ace/mode/markdown');
    aceEditor.setOption('showLineNumbers', true);
    aceEditor.setFontSize('16px');
    aceEditor.session.setUseWrapMode(true);
    aceEditor.session.setWrapLimitRange(null, null);
    aceEditor.setValue('');

    setTimeout(() => {
        introMessage.classList.add('fade-out');
        setTimeout(() => {
            introMessage.style.display = 'none';
            navbar.style.display = 'flex';
            mainContent.style.display = 'flex';
        }, 1000);
    }, 2000);

    function updateDocumentBar() {
        if (currentDocument) {
            documentNameInputEditable.value = currentDocument.title;
            documentNameText.textContent = currentDocument.title;
        }
    }

    function updateDocumentName() {
        if (currentDocument) {
            const newName = documentNameInputEditable.value.trim();
            if (newName) {
                currentDocument.title = newName;
                updateDocumentBar();
                updateDocumentList();
                saveDocuments();
            }
        }
    }

    documentBtn.addEventListener('click', () => {
        if (documentList.style.display === 'none' || documentList.style.display === '') {
            documentList.style.display = 'block';
            documentIconSymbol.classList.remove('fa-file-alt');
            documentIconSymbol.classList.add('fa-xmark');
        } else {
            documentList.style.display = 'none';
            documentIconSymbol.classList.remove('fa-xmark');
            documentIconSymbol.classList.add('fa-file-alt');
        }
        updateDocumentBar();
    });

    function loadDocument(doc) {
        currentDocument = doc;
        aceEditor.setValue(doc.content);
        updatePreview();
        updateDocumentList();
        updateDocumentBar();
    }

    if (documents.length > 0) {
        currentDocument = documents[0];
        aceEditor.setValue(currentDocument.content);
        updatePreview();
        updateDocumentList();
        updateDocumentBar();
    } else {
        createNewDocument('Untitled');
    }

    aceEditor.getSession().on('change', () => {
        updatePreview();
        if (currentDocument) {
            currentDocument.content = aceEditor.getValue();
            saveDocuments();
        }
    });

    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.nav-link');
        const content = dropdown.querySelector('.dropdown-content');
        if (link && content) {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
            });
            document.addEventListener('click', function(event) {
                if (!dropdown.contains(event.target)) {
                    content.style.display = 'none';
                }
            });
        }
    });

    function updatePreview() {
        marked.setOptions({ breaks: true, tables: true });
        preview.innerHTML = marked.parse(aceEditor.getValue());
    }

    async function createNewDocument(name) {
        try {
            const introductoryMarkdown = await fetchIntroMarkdown();
            const doc = { id: Date.now(), title: name, content: introductoryMarkdown };
            documents.push(doc);
            currentDocument = doc;
            updateDocumentList();
            aceEditor.setValue(introductoryMarkdown);
            updatePreview();
            saveDocuments();
        } catch (error) {
            console.error('Error creating new document:', error);
        }
    }

    function updateDocumentList() {
        documentList.innerHTML = '';
        documents.forEach(doc => {
            const li = document.createElement('li');
            li.className = 'document-item';
            li.innerHTML = `
                <span class="document-name">${doc.title}</span>
                <span class="document-icon"><i class="fas fa-file-alt"></i></span>
                ${documents.length > 1 ? `<span class="delete-icon" aria-label="Delete Document"><i class="fa-solid fa-minus" onclick="deleteDocument(${doc.id})"></i></span>` : ''}
            `;
            if (doc === currentDocument) {
                li.classList.add('active');
            }
            li.addEventListener('click', () => loadDocument(doc));
            documentList.appendChild(li);
        });
    }

    deleteIcon.addEventListener('click', () => {
        if (currentDocument) {
            deleteDocument(currentDocument.id);
        }
    });

    function deleteDocument(docId) {
        documents = documents.filter(doc => doc.id !== docId);
        if (currentDocument.id === docId) {
            if (documents.length > 0) {
                loadDocument(documents[0]);
            } else {
                createNewDocument('Untitled');
            }
        }
        updateDocumentList();
        saveDocuments();
    }

    function enableNameEdit(span, doc) {
        const originalName = doc.title;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = originalName;
        input.className = 'document-name-input';
        span.replaceWith(input);
        input.focus();
        input.addEventListener('blur', () => saveDocumentName(input, span, doc));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveDocumentName(input, span, doc);
            }
        });
    }

    documentNameInputEditable.addEventListener('blur', saveDocumentNameEditable);
    documentNameInputEditable.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveDocumentNameEditable();
        }
    });

    function saveDocumentName(input, span, doc) {
        const newName = input.value.trim();
        if (newName) {
            doc.title = newName;
            saveDocuments();
            span.textContent = newName;
            input.replaceWith(span);
            updateDocumentBar();
            updateDocumentList();
        } else {
            input.replaceWith(span);
            span.textContent = originalName;
        }
    }

    function saveDocuments() {
        localStorage.setItem('documents', JSON.stringify(documents));
    }

    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
        aceEditor.setTheme('ace/theme/monokai');
    } else {
        aceEditor.setTheme('ace/theme/chrome');
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (event) => {
            event.preventDefault();
            document.body.classList.toggle('dark-mode');
            const newTheme = darkModeToggle.checked ? 'ace/theme/monokai' : 'ace/theme/chrome';
            aceEditor.setTheme(newTheme);
            localStorage.setItem('darkMode', darkModeToggle.checked);
        });
    }

    if (exportPDF) {
        exportPDF.addEventListener('click', (event) => {
            event.preventDefault();
            const element = document.getElementById('preview-area');
            const options = {
                margin: 1,
                filename: `${currentDocument.title}.pdf`,
                html2canvas: { scale: 4 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            html2pdf().from(element).set(options).save();
        });
    }

    if (exportHTML) {
        exportHTML.addEventListener('click', (event) => {
            event.preventDefault();
            const blob = new Blob([preview.innerHTML], { type: 'text/html;charset=utf-8' });
            saveAs(blob, `${currentDocument.title}.html`);
        });
    }

    if (importMD) {
        importMD.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = event => {
                    createNewDocument('Imported Document');
                    aceEditor.setValue(event.target.result);
                    updatePreview();
                };
                reader.readAsText(file);
            }
        });
    }

    if (downloadMD) {
        downloadMD.addEventListener('click', (event) => {
            event.preventDefault();
            const blob = new Blob([aceEditor.getValue()], { type: 'text/markdown;charset=utf-8' });
            saveAs(blob, `${currentDocument.title}.md`);
        });
    }

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    if (newDocument) {
        newDocument.addEventListener('click', (event) => {
            event.preventDefault();
            modal.style.display = 'flex';
            modal.classList.add('show');
        });
    }

    if (closeModalButton) {
        closeModalButton.addEventListener('click', (event) => {
            event.preventDefault();
            modal.style.display = 'none';
            modal.classList.remove('show');
        });
    }

    if (createButton) {
        createButton.addEventListener('click', (event) => {
            event.preventDefault();
            const documentName = documentNameInput.value.trim();
            if (documentName) {
                createNewDocument(documentName);
                newDocumentModal.style.display = 'none';
                documentNameInput.value = '';
                editorSection.style.display = 'block';
                previewSection.style.display = 'flex';
            } else {
                alert('Please enter a document name.');
            }
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            modal.classList.remove('show');
        }
    });

    function toggleFullscreen(section, button) {
        const isFullscreen = section.classList.toggle('fullscreen-active');
        const icon = button.querySelector('i');
        icon.classList.toggle('fa-expand', !isFullscreen);
        icon.classList.toggle('fa-compress', isFullscreen);
    }

    if (fullscreenEditorBtn) {
        fullscreenEditorBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleFullscreen(editorSection, fullscreenEditorBtn);
        });
    }

    if (fullscreenPreviewBtn) {
        fullscreenPreviewBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleFullscreen(previewSection, fullscreenPreviewBtn);
        });
    }
});