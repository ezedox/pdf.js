let flatten = (arr) => {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ?
      flatten(toFlatten) : toFlatten);
  }, []);
};

let getPartyEmailId = (partyId) => {
  let emailId = '';
  try {
    emailId = document.getElementById(partyId)
        .querySelector('.share-email-input').value;
  } catch (error) {}

  return emailId;
};

class EsignPlaceholderContainer {
  constructor(width, height, pageNo, textLayerDiv) {
    this.height = height;
    this.width = width;
    this.pageNo = pageNo;
    this.textLayerDiv = textLayerDiv;
  }

  showAssignedSignaturePlaceholders(currentDocument, container) {
    currentDocument.coordinates.forEach((coordinate) => {
      if (coordinate.page === this.pageNo) {
        let values = {
          pageNo: coordinate.page,
          left: coordinate.left,
          top: coordinate.top,
          pageWidth: this.width,
          pageHeight: this.height,
        };
        // function defined in previewActions.js
        let placeholderDiv = window.createSignaturePlaceholders(values);
        container.appendChild(placeholderDiv);
      }
    });
  }

  showUnsavedSignaturePlaceholders(currentDocument, container) {
    let currentPageNo = this.pageNo;
    let width = this.width;
    let height = this.height;

    let arr = Array.from(currentDocument._contractPlaceholders,
      (v, i) => {
        return v[1];
      }
    );

    let signaturePlaceholders = flatten(arr);
    let currentPagePlaceholders = signaturePlaceholders
      .filter((signaturePlaceholder) => {
        return signaturePlaceholder.page &&
          signaturePlaceholder.page === currentPageNo;
      });

    currentPagePlaceholders.forEach(function (placeholder) {
      let placeholderDiv = document.createElement('div');
      placeholderDiv.id = placeholder.id;
      placeholderDiv.className += ' contract-esign-placeholder';
      placeholderDiv.setAttribute('data-party-id',
        placeholder.partyId);
      placeholderDiv.style.width = placeholder.width;
      placeholderDiv.style.height = placeholder.height;
      placeholderDiv.style.left = placeholder.leftPercentage;
      placeholderDiv.style.top = placeholder.topPercentage;
      // override postion: relative when page is rerendered
      placeholderDiv.style.position = 'absolute';

      let partyEmailId = getPartyEmailId(placeholder.partyId);

      placeholderDiv.innerHTML =
        '<span class=\'contract-esign-placeholder-text\'>' +
        partyEmailId +
        '</span>';

      container.appendChild(placeholderDiv);

      // To allow dragging of the marked placeholder
      // function defined in previewActons.js
      window.makePlaceholderDraggable(
        window.jQuery(placeholderDiv),
        placeholder,
        width,
        height,
        currentPageNo
      );
    });
  }

  showSignaturePlaceholders() {
    // create a overlay for each page
    let esignCursorWrapper = document.createElement('div');
    esignCursorWrapper.style.width = this.width;
    esignCursorWrapper.style.height = this.height;
    esignCursorWrapper.classList.add('esignCursorWrapper');

    // cursor img for each page
    let esignCursoritem = document.createElement('div');
    esignCursoritem.classList.add('esign-cursor');
    esignCursoritem.textContent = 'Pick a spot';

    esignCursorWrapper.appendChild(esignCursoritem);

    // If the preview is contract signing mode, reprint signature placeholders
    try {
      let previewModal = document.getElementById('preview-modal');
      if (previewModal) {
        let docId = previewModal.getAttribute('data-preview');
        let currentDocument = window.documentManager.getInstance()
          .documents.get(docId);

        if (currentDocument) {
          let isSigningAllowed = false;
          if (currentDocument.temp_category === 'shared' &&
            currentDocument.signingStatus === 'NOTSIGNED') {
            isSigningAllowed = true;
          } else if (currentDocument.temp_category === 'unorganized' &&
            currentDocument.isSignedByOwner === 'false') {
            isSigningAllowed = true;
          }

          if (isSigningAllowed) {

            // if contract signatures are assigned
            if (Array.isArray(currentDocument.coordinates)) {

              // append all placeholders for this page to the container
              this.showAssignedSignaturePlaceholders(
                currentDocument,
                esignCursorWrapper
              );
              if (currentDocument.coordinates.length) {
                // to show the placeholders
                // and to Increase the opacity of textlayer
                this.textLayerDiv.classList.add('show-placeholder');
              }

            } else {

              if (previewModal.classList.contains('contract-signing-active') &&
                currentDocument._contractPlaceholders) {
                this.showUnsavedSignaturePlaceholders(
                  currentDocument,
                  esignCursorWrapper
                );
              }
            }
          }
        }
      }
    } catch (error) {}

    return esignCursorWrapper;
  }

}

export {
  EsignPlaceholderContainer,
};
