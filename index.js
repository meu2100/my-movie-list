const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

//拿到資料以後，我們需要一個容器來存放這個有 80 個項目的陣列，注意這裡我們使用 const代表我們希望 movies 的內容維持不變，其他人閱讀到 const movies 時，也會意識到 movies 裡面放的是不會被隨便更動的資料。
const movies = []
//儲存符合篩選條件的項目
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input') //新增這裡



function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title, image
    rawHTML += `
    <div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
    </div>`
  })
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`
  })
}

//新增喜愛電影的製作清單
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//設計more按鈕中的內容
// 監聽 data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//監聽searchBar的事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //取消預設事件
  event.preventDefault()
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()
 
  //錯誤處理：輸入無效字串
  if (!keyword.length) {
    return alert('請輸入有效字串！')
  }
  //條件篩選
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  //重製分頁器
  renderPaginator(filteredMovies.length)  //新增這裡
  //預設顯示第 1 頁的搜尋結果
  renderMovieList(getMoviesByPage(1))  //修改這裡
})

//製作分頁器
function getMoviesByPage(page) {
  //新增這裡
  const data = filteredMovies.length ? filteredMovies : movies
  //計算起始 index
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

const paginator = document.querySelector('#paginator')

function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作 template
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}

paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  renderMovieList(getMoviesByPage(page))
})

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length) //新增這裡
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))
