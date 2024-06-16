// script.js
const apiKey = "Uz31QkDBBLPkpB5bi1T5AKJvfdsgrGvFeMQxdZkL1zI";
const apiUrl = "https://api.unsplash.com/photos/random";
const searchUrl = "https://api.unsplash.com/search/photos";
const perPage = 20;

let currentPage = 1;
let totalPages = 1;
let images = [];
let searchQuery = "";
let isSearching = false;

function fetchImages() {
  const params = new URLSearchParams({
    client_id: apiKey,
    count: perPage,
    page: currentPage,
    query: searchQuery,
  });

  const url = isSearching ? `${searchUrl}?${params}` : `${apiUrl}?${params}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (isSearching) {
        images = data.results;
        totalPages = data.total_pages;
      } else {
        images = [...images, ...data];
        totalPages = Math.ceil(data.total / perPage);
      }
      renderImages();
      initializeZoom();
    })
    .catch((error) => console.error("Error fetching images:", error));
}

function renderImages() {
  const galleryContainer = document.querySelector(".gallery");
  galleryContainer.innerHTML = "";

  images.forEach((image) => {
    const imageElement = createImageElement(image.urls.regular);
    galleryContainer.appendChild(imageElement);
  });

  const loadMoreButton = document.getElementById("loadMoreButton");
  loadMoreButton.disabled = currentPage === totalPages;

  if (currentPage === 1) {
    window.addEventListener("scroll", handleInfiniteScroll);
  }
}

function createImageElement(src) {
  const img = document.createElement("img");
  img.src = src;
  img.alt = "Image";
  img.classList.add("img-thumbnail");
  img.addEventListener("click", showImageModal);
  img.loading = 'lazy';
  return img;
}



function showImageModal(event) {
  const modalImage = document.getElementById("modalImage");
  const downloadLink = document.getElementById("downloadLink");

  modalImage.src = event.target.src;
  downloadLink.href = event.target.src;

  $("#imageModal").modal("show");

  anime({
    targets: modalImage,
    opacity: [0, 1],
    scale: [0.8, 1],
    duration: 500,
    easing: "easeOutExpo",
  });
}



function initializeZoom() {
  const modalImage = document.getElementById("modalImage");
  const zoomInstance = new Zoom(modalImage, {
    pan: true,
    scale: 2,
    transition: true,
  });

  $(modalImage).on("shown.bs.modal", function () {
    zoomInstance.attach();
  });

  $(modalImage).on("hidden.bs.modal", function () {
    zoomInstance.detach();
  });
}

function handleInfiniteScroll() {
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = document.documentElement.scrollTop;
  const clientHeight = document.documentElement.clientHeight;

  if (
    scrollTop + clientHeight >= scrollHeight - 100 &&
    currentPage < totalPages
  ) {
    currentPage++;
    fetchImages();
    window.removeEventListener("scroll", handleInfiniteScroll);
  }
}


/// 

// Initialize collections from localStorage
let collections = JSON.parse(localStorage.getItem('collections')) || {};

function showImageModal(event) {
  const modalImage = document.getElementById('modalImage');
  const downloadLink = document.getElementById('downloadLink');
  const imageUrl = event.target.src;

  modalImage.src = imageUrl;
  downloadLink.href = imageUrl;

  $('#imageModal').modal('show');

  anime({
    targets: modalImage,
    opacity: [0, 1],
    scale: [0.8, 1],
    duration: 500,
    easing: 'easeOutExpo',
  });

  // Add collection buttons to the modal
  const modalFooter = document.querySelector('#imageModal .modal-footer');
  const collectionButtons = Object.keys(collections).map(collectionName => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-outline-primary mr-2';
    button.textContent = collectionName;
    button.addEventListener('click', () => toggleImageInCollection(imageUrl, collectionName));
    return button;
  });
  modalFooter.append(...collectionButtons);

  const createCollectionButton = document.createElement('button');
  createCollectionButton.type = 'button';
  createCollectionButton.className = 'btn btn-outline-primary';
  createCollectionButton.textContent = 'Create Collection';
  createCollectionButton.addEventListener('click', () => $('#createCollectionModal').modal('show'));
  modalFooter.appendChild(createCollectionButton);
}

function toggleImageInCollection(imageUrl, collectionName) {
  const collection = collections[collectionName] || [];
  const imageIndex = collection.indexOf(imageUrl);

  if (imageIndex === -1) {
    collection.push(imageUrl);
  } else {
    collection.splice(imageIndex, 1);
  }

  collections[collectionName] = collection;
  localStorage.setItem('collections', JSON.stringify(collections));
}

const createCollectionButton = document.getElementById('createCollectionButton');
const collectionNameInput = document.getElementById('collectionNameInput');

createCollectionButton.addEventListener('click', () => {
  const collectionName = collectionNameInput.value.trim();
  if (collectionName) {
    collections[collectionName] = [];
    localStorage.setItem('collections', JSON.stringify(collections));
    collectionNameInput.value = '';
    $('#createCollectionModal').modal('hide');
  }
});



//

const navbarNav = document.getElementById('navbarNav');
const viewCollectionsLink = document.createElement('li');
viewCollectionsLink.className = 'nav-item';
viewCollectionsLink.innerHTML = '<a class="nav-link" href="#" data-toggle="modal" data-target="#viewCollectionsModal">View Collections</a>';
navbarNav.appendChild(viewCollectionsLink);

function showCollections() {
    const collectionsContainer = document.querySelector('#viewCollectionsModal .collections-container');
    collectionsContainer.innerHTML = '';
  
    for (const collectionName in collections) {
      const collectionDiv = document.createElement('div');
      collectionDiv.className = 'collection mb-4';
  
      const collectionHeader = document.createElement('h5');
      collectionHeader.textContent = collectionName;
  
      const collectionImages = document.createElement('div');
      collectionImages.className = 'collection-images';
  
      collections[collectionName].forEach(imageUrl => {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Collection Image';
        img.className = 'img-thumbnail mr-2 mb-2';
        img.style.maxHeight = '100px';
        collectionImages.appendChild(img);
      });
  
      collectionDiv.appendChild(collectionHeader);
      collectionDiv.appendChild(collectionImages);
      collectionsContainer.appendChild(collectionDiv);
    }
  
    $('#viewCollectionsModal').modal('show');
  }
///

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

searchButton.addEventListener("click", (e) => {
  e.preventDefault();
  searchQuery = searchInput.value.trim();
  if (searchQuery) {
    isSearching = true;
    currentPage = 1;
    totalPages = 1;
    images = [];
    fetchImages();
    searchInput.value = '';
  }
});

const loadMoreButton = document.getElementById("loadMoreButton");
loadMoreButton.addEventListener("click", () => {
  currentPage++;
  fetchImages();
});

fetchImages();

initializeZoom();
