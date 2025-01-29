
document.querySelector('#closeSidebarBtn').addEventListener('click', function() {
    var sidebar = document.querySelector('#sidebar');
    var closeBtn = document.querySelector('#closeSidebarBtn');
    var openBtn = document.querySelector('#openSidebarBtn');
    var wrapper = document.querySelector(".wrapper");

    wrapper.classList.toggle("collapsed");

    sidebar.classList.toggle('closed');

    if (sidebar.classList.contains('closed')) {
        sidebar.style.width = '50px';  
        closeBtn.style.display = 'none';  
        openBtn.style.display = 'block';  
    } else {
        sidebar.style.width = '250px'; 
        closeBtn.style.display = 'block';  
        openBtn.style.display = 'none';  
    }
});


document.querySelector('#openSidebarBtn').addEventListener('click', function() {
    var sidebar = document.querySelector('#sidebar');
    var closeBtn = document.querySelector('#closeSidebarBtn');
    var openBtn = document.querySelector('#openSidebarBtn');
    var wrapper = document.querySelector(".wrapper");

    wrapper.classList.remove("collapsed");
    sidebar.classList.remove('closed');
    sidebar.style.width = '250px';  
    closeBtn.style.display = 'block';  
    openBtn.style.display = 'none';  
});

function fetchPDFPreview(reportType) {
    var pdfPreview = document.getElementById('pdf-preview');
    pdfPreview.src = 'data:image/jpeg;base64,YOUR_BASE64_ENCODED_IMAGE';
    pdfPreview.style.display = 'block';
}



document.addEventListener('DOMContentLoaded', function() {
    var reportSelectField = document.getElementById('id_of_your_report_select_field');
    if (reportSelectField) {
        reportSelectField.addEventListener('change', function() {
            fetchPDFPreview(this.value);
        });
    }
});