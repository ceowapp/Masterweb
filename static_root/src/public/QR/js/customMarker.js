var innerImageURL = null;
var fullMarkerURL = null;
var imageName = null;

innerImageURL = '../static/src/public/QR/images/inner-hiro.png';
updateFullMarkerImage();

document.querySelector('#buttonDownloadEncoded').addEventListener('click', function(){
    if (innerImageURL === null){
        alert('upload a file first');
        return;
    }
    console.assert(innerImageURL);
    THREEx.ArPatternFile.encodeImageURL(innerImageURL, function onComplete(patternFileString){
        THREEx.ArPatternFile.triggerDownload(patternFileString, "pattern-" + (imageName || "marker") + ".patt");
    });
});


	document.querySelector('#buttonDownloadFullImage').addEventListener('click', function(){
		// debugger
		if( innerImageURL === null ){
			alert('upload a file first')
			return
		}

		// tech from https://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
		var domElement = window.document.createElement('a');
		domElement.href = fullMarkerURL;
		domElement.download = "pattern-" + (imageName || 'marker') + '.png';
		document.body.appendChild(domElement)
		domElement.click();
		document.body.removeChild(domElement)
	})



	document.querySelector('#patternRatioSlider').addEventListener('input', function(){
		// update the patternRatio number
		var patternRatio = document.querySelector('#patternRatioSlider').value/100
		var domElement = document.querySelector('[for=patternRatioSlider] span')
		domElement.innerHTML = `Pattern Ratio ${patternRatio.toFixed(2)}`

		// update fullMarkerImage
		updateFullMarkerImage()
	})

	document.querySelector('#imageSize').addEventListener('input', function(){
		// update the patternRatio number
		var imageSize = document.querySelector('#imageSize').value
		var domElement = document.querySelector('[for=imageSize] span')
		domElement.innerHTML = `Image size ${imageSize}px`

		// update fullMarkerImage
		updateFullMarkerImage()
	})

	document.querySelector('#borderColor').addEventListener('input', function(){
		var imageSize = document.querySelector('#borderColor').value
		var domElement = document.querySelector('[for=borderColor] span')

		// update fullMarkerImage
		updateFullMarkerImage()
	})


	document.querySelector('#fileinput').addEventListener('change', function(){
		var file = this.files[0];
		imageName = file.name
		// remove file extension
		imageName = imageName.substring(0, imageName.lastIndexOf('.')) || imageName
		
		// debugger

		var reader = new FileReader();
		reader.onload = function(event){
			innerImageURL = event.target.result
			updateFullMarkerImage()
		};
		reader.readAsDataURL(file);
	})

	// Update the updateFullMarkerImage function as follows
	function updateFullMarkerImage() {
	    var patternRatioSlider = document.querySelector('#patternRatioSlider');
	    var imageSizeInput = document.querySelector('#imageSize');
	    var borderColorInput = document.querySelector('#borderColor');

	    if (!patternRatioSlider || !imageSizeInput || !borderColorInput) {
	        console.error("One or more input elements not found.");
	        return;
	    }

	    var patternRatio = patternRatioSlider.value / 100;
	    var imageSize = imageSizeInput.value;
	    var borderColor = borderColorInput.value;

		function hexaColor(color) {
			return /^#[0-9A-F]{6}$/i.test(color);
		};

		var s = new Option().style;
		s.color = borderColor;
  		if (borderColor === '' || (s.color != borderColor && !hexaColor(borderColor))) {
			// if color not valid, use black
			borderColor = 'black';
		}

		THREEx.ArPatternFile.buildFullMarker(innerImageURL, patternRatio, imageSize, borderColor, function onComplete(markerUrl){
			fullMarkerURL = markerUrl

			var fullMarkerImage = document.createElement('img')
			fullMarkerImage.src = fullMarkerURL

			// put fullMarkerImage into #imageContainer
			var container = document.querySelector('#imageContainer')
			while (container.firstChild) container.removeChild(container.firstChild);
			container.appendChild(fullMarkerImage)
		})
	}

	//////////////////////////////////////////////////////////////////////////////
	//		Handle PDF
	//////////////////////////////////////////////////////////////////////////////
	document.querySelector('#buttonDownloadPDFOnePerPage').addEventListener('click', generatePdfOnePerPage)
	document.querySelector('#buttonDownloadPDFTwoPerPage').addEventListener('click', generatePdfTwoPerPage)
	document.querySelector('#buttonDownloadPDFSixPerPage').addEventListener('click', generatePdfSixPerPage)

	function generatePdfOnePerPage(){
	        var docDefinition = {
			content: [
				{
					image: fullMarkerURL,
					width: 600,
					alignment: 'center',
				},
			]
	        }
	        pdfMake.createPdf(docDefinition).open();
	}
	function generatePdfTwoPerPage(){
	        var docDefinition = {
			content: [
				{
					image: fullMarkerURL,
					width: 300,
					alignment: 'center',
				},
				{
					image: fullMarkerURL,
					width: 300,
					alignment: 'center',
				},
			]
	        }
	        pdfMake.createPdf(docDefinition).open();
	}
	function generatePdfSixPerPage(){
	        var docDefinition = {
	                content: [
				{
					columns: [
			                        {
			                                image: fullMarkerURL,
			                                width: 250,
			                        },
			                        {
			                                image: fullMarkerURL,
			                                width: 250,
			                        },
					]
				},
				{
					columns: [
			                        {
			                                image: fullMarkerURL,
			                                width: 250,
			                        },
			                        {
			                                image: fullMarkerURL,
			                                width: 250,
			                        },
					]
				},
				{
					columns: [
			                        {
			                                image: fullMarkerURL,
			                                width: 250,
			                        },
			                        {
			                                image: fullMarkerURL,
			                                width: 250,
			                        },
					]
				},
	                ],
	        }
	        pdfMake.createPdf(docDefinition).open();
	}

