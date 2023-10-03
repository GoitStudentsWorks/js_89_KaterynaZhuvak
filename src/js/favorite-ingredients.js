import * as basicLightbox from 'basiclightbox';
import Pagination from 'tui-pagination';
import 'tui-pagination/dist/tui-pagination.css';

import { onClickIn } from './popupingredients';

const list = document.querySelector('.favorite-ingredients-list');
const sorryImage = document.querySelector('.sorry-ingredients');
const paginationContainer = document.querySelector('.pagination-main');
const favorite =
  JSON.parse(localStorage.getItem('KEY_FAVORITE_INGREDIENTS')) ?? [];

console.log(favorite);

let currentPage = 1;
let ingredientsPerPage = 8;
if (screen.width >= 1280) {
  ingredientsPerPage = 9;
}

sorryImage.classList.add('hidden');
renderMarkup(favorite, list);

if (!favorite.length) {
  sorryImage.classList.remove('hidden');
}

list.addEventListener('click', onClick);

function renderMarkup(arr, container) {
  container.innerHTML = '';
  paginationContainer.innerHTML = '';
  if (arr.length <= ingredientsPerPage) {
    container.innerHTML = arr
      .map(card => {
        let isAcloholic = 'Alcoholic';
        if (card.abv === '0') {
          isAcloholic = 'Non-alcoholic';
        }
        return `<li class="in-card" data-id=${card.id}>
        <h3 class="in-card-title">${card.title}</h3>
        <p class="in-card-alco">${isAcloholic}</p>
        <p class="in-card-descr">${card.description || 'No data'}</p>
        <div class="in-card-btns"><button class="btn-learn-more">learn more</button><button class="btn-remove"><svg class="remove-icon">
        <use href="./img/sprite.svg#trash"></use>
        </svg></button></div>
</li>`;
      })
      .join('');
  } else {
    showPaginatedList(favorite, list, ingredientsPerPage, currentPage);
    SetupPagination(favorite, paginationContainer, ingredientsPerPage);
  }

  // container.innerHTML = markup;
}

function showPaginatedList(arr, container, per_page, page) {
  container.innerHTML = '';
  page--;

  let start = per_page * page;
  let end = start + per_page;
  let markup = arr.slice(start, end);

  return renderMarkup(markup, list);

  // container.innerHTML = markup;
}

function SetupPagination(items, wrapper, per_page) {
  wrapper.innerHTML = '';

  // let page_count = Math.ceil(items.length / per_page);

  const options = {
    totalItems: items.length,
    itemsPerPage: per_page,
    //   visiblePages: 10,
    page: 1,
    centerAlign: false,
    firstItemClassName: 'tui-first-child',
    lastItemClassName: 'tui-last-child',
    template: {
      page: '<a href="#" class="tui-page-btn btnStyle">{{page}}</a>',
      currentPage:
        '<strong class="tui-page-btn tui-is-selected btnStyleActive">{{page}}</strong>',
      moveButton:
        '<a href="#" class="tui-page-btn tui-{{type}} btnStyle">' +
        '<span class="tui-ico-{{type}}">{{type}}</span>' +
        '</a>',
      disabledMoveButton:
        '<span class="tui-page-btn tui-is-disabled tui-{{type}} btnStyle">' +
        '<span class="tui-ico-{{type}}">{{type}}</span>' +
        '</span>',
      moreButton:
        '<a href="#" class="tui-page-btn tui-{{type}}-is-ellip">' +
        '<span class="tui-ico-ellip">...</span>' +
        '</a>',
    },
  };
  // console.log(options);

  const pagination = new Pagination(paginationContainer, options);

  pagination.on('beforeMove', evt => {
    const { page } = evt;
    const result = showPaginatedList(favorite, list, ingredientsPerPage, page);
  });
}

function onClick(e) {
  if (e.target.classList.contains('btn-learn-more')) {
    const ingredient = findIngredient(e.target);
    const instance = basicLightbox.create(
      `<div id="modal-ingredients" class="modal-in">
      <button type="button" class="modal-in-close-button close-cocktail-modal-x">
        <svg class="icon-in-close" width="11" height="11">
          <use href="./img/sprite.svg#cross"></use>
        </svg>
      </button>
    <div class="descripe-ingredients" data-id="${
      ingredient.id
    }"><div class="header-in">
          <h2 id="ingredients-title" class="ingredients-title">${
            ingredient.title
          }</h2>
          <p class="kind-in">${ingredient.type}</p>
        </div>
        <div class="ingredients-information">
          <p class="main-description-in">${
            ingredient.description || 'No data'
          }</p>
          <ul class="ingredients-spec">
            <li class="ingredients-description">Type: ${
              ingredient.type || 'No data'
            }</li>
            <li class="ingredients-description">Country of origin: ${
              ingredient.country || 'No data'
            }</li>
            <li class="ingredients-description">Alcohol by volume: ${
              ingredient.abv || 'No data'
            }</li>
            <li class="ingredients-description">Flavour: ${
              ingredient.flavour || 'No data'
            }</li>
          </ul>
        </div>
        <div class="buttons-in">
          <button class="btn-in remove-btn">REMOVE FROM FAVORITE</button>
          <button type="button" id="btn-back" class="btn-in btn-back close-cocktail-modal-back">
            BACK
          </button></div></div>`,
      {
        onShow: instance => {
          instance
            .element()
            .querySelector('.close-cocktail-modal-back').onclick =
            instance.close;
          instance.element().querySelector('.close-cocktail-modal-x').onclick =
            instance.close;
          instance
            .element()
            .querySelector('.remove-btn')
            .addEventListener('click', onRemoveClick);
          instance.element().querySelector('.remove-btn').onclick =
            instance.close;
        },
      }
    );
    instance.show();
  }
  if (e.target.closest('.btn-remove') || e.target.closest('.btn-in')) {
    removeIngredient(e);
    if (!favorite.length) {
      sorryImage.classList.remove('hidden');
    }
  }
}

function findIngredient(elem) {
  const ingredientId = elem.closest('.in-card').dataset.id;
  return favorite.find(({ id }) => id === ingredientId);
}

function removeIngredient(e) {
  const ingredient = findIngredient(e.target);
  const itemToRemove = favorite.findIndex(({ id }) => id === ingredient.id);
  favorite.splice(itemToRemove, 1);
  localStorage.setItem('KEY_FAVORITE_INGREDIENTS', JSON.stringify(favorite));
  renderMarkup(favorite, list);
}

function onRemoveClick(e) {
  const ingredientId = e.target.closest('.descripe-ingredients').dataset.id;
  const ingredient = favorite.find(({ id }) => id === ingredientId);
  const itemToRemove = favorite.findIndex(({ id }) => id === ingredient.id);
  favorite.splice(itemToRemove, 1);
  localStorage.setItem('KEY_FAVORITE_INGREDIENTS', JSON.stringify(favorite));
  renderMarkup(favorite, list);
}
