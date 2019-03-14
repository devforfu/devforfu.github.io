(async () => {
    const loadingTask = PDFJS.getDocument("/asserts/pdf/resume.pdf");
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const scale = 1;
    const viewport = page.getViewport(scale);
    const canvas = document.getElementById("pdf");
    const ctx = canvas.getContext("2d");
    ctx.height = viewport.height;
    ctx.width = viewport.width;
    const renderContext = {
        canvasContext: ctx,
        viewport: viewport
    }
    await page.render(renderContext);
}();
