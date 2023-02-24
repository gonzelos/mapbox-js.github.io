let config = {
  square: {
    viewSize: [400, 400],
    scaleValue: {
      cm: [
        [20, 20, 100],
        [30, 30, 200],
        [40, 40, 300],
        [50, 50, 400],
        [60, 60, 500],
        [70, 70, 600],
        [80, 80, 700],
        [90, 90, 800],
      ],
      inch: [
        [5, 5, 100],
        [10, 10, 200],
        [15, 15, 300],
        [20, 20, 400],
        [25, 25, 500],
        [30, 30, 600],
        [35, 35, 700],
        [40, 40, 800],
      ]
    },
  },
  portrait: {
    viewSize: [340, 440],
    scaleValue: {
      cm: [
        [10, 15, 110],
        [30, 30, 200],
        [40, 40, 300],
        [50, 50, 400],
        [60, 60, 500],
        [70, 70, 600],
        [80, 80, 700],
        [90, 90, 800],
      ],
      inch: [
        [5, 5, 100],
        [10, 10, 200],
        [15, 15, 300],
        [20, 20, 400],
        [25, 25, 500],
        [30, 30, 600],
        [35, 35, 700],
        [40, 40, 800],
      ]
    }
  },
  landscape: {
    viewSize: [440, 340],
    scaleValue: {
      cm: [
        [15, 10, 110],
        [30, 30, 200],
        [40, 40, 300],
        [50, 50, 400],
        [60, 60, 500],
        [70, 70, 600],
        [80, 80, 700],
        [90, 90, 800],
      ],
      inch: [
        [5, 5, 100],
        [10, 10, 200],
        [15, 15, 300],
        [20, 20, 400],
        [25, 25, 500],
        [30, 30, 600],
        [35, 35, 700],
        [40, 40, 800],
      ]
    }
  },
}

mapboxgl.accessToken = 'pk.eyJ1IjoiaHViZXJ0dXoiLCJhIjoiY2lqdGtrdWkwMDQ3enRha3MybG44Ym1vciJ9.7V6Q9IJm5P5NVsW5mVttFQ';

let savedData = localStorage.getItem("currentMapData");

let mapData =  savedData ? JSON.parse(savedData) : {
  config: {
    viewType: "square",
    scale: 0,
    unit: "cm",
  },
  lng: -122.44944,//21.06,
  lat: 37.76803,//52.23,
  style_id: "clecywkgm002801qro1y8p3eu",
  bearing: 0,
  zoom: 8.9,
  frTitPos: "center",
  frTitle: "Warsaw, Masovian Voivodeship, Poland",
  backTitle: "Stand by me forever",
};

function setMapView(w, h) {
  $("#map").css('width', w);
  $("#map").css('height', h);
  $(".map-poster").css('width', w + 100);
  $(".map-poster").css('height', h + 120);
  map.resize();
}

function renderScaleButton() {
  let selectedScaleItems = config[mapData.config.viewType].scaleValue[mapData.config.unit];
  let $scaleBtn = $(".size-value > .size-type-wrapper").eq(0);
  $(".size-value").html("");
  selectedScaleItems.forEach((item, index) => {
    let [w, h, p] = item;
    $scaleBtn.find('.scale').text(`${w}x${h}`);
    $scaleBtn.find('.price').text(`${p}$`);
    if(index == mapData.config.scale) {
      $scaleBtn.addClass("active");
      let unit = mapData.config.unit == 'cm' ? "'" : '"';
      $('.scale-value').text(`${w + unit} x ${h + unit}`);
    } else {
      $scaleBtn.removeClass("active");
    }
    $scaleBtnClone = $scaleBtn.clone();
    $scaleBtnClone.data("value", index);
    $(".size-value").append($scaleBtnClone);
  });
}

function setMapData() {
  const str = getImgLink(mapData.style_id);
  $("#downloadImage").attr('href', str);
  // $("#image").attr("src", str);
  $("#front-string").val(mapData.frTitle);
  $(".citymap-poster-name").text(mapData.frTitle);
  $("#back-string").val(mapData.backTitle);
  $(".back-title").text(mapData.backTitle);
  $(".citymap-poster-tagline").text(getDisplayLngLat());
  
  $(`.size-type-div > .size-unit-wrapper > .size-unit[data-value=${mapData.config.unit}]`).addClass("active");
  $(`.size-type-div > .size-type-wrapper[data-value=${mapData.config.viewType}]`).trigger("click");

  $('.map-poster').css("opacity", 1);
  
  localStorage.setItem("currentMapData", JSON.stringify(mapData));
}

function getImgLink(style_id) {
  let [w, h] = config[mapData.config.viewType].viewSize;
  return `https://api.mapbox.com/styles/v1/hubertuz/${style_id}/static/${mapData.lng},${mapData.lat},${mapData.zoom}/${w}x${h}?access_token=${mapboxgl.accessToken}`;
}

function download(imgUrl, fileName) {
  var img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imgUrl;
    // Create a canvas element
    img.onload = () => {
      var canvas = document.createElement('canvas');
      let viewType = mapData.config.viewType;
      if(viewType == "square") {
        canvas.width = 2000;
        canvas.height = 2000;
      } else if(viewType == "portrait") {
        canvas.width = 1700;
        canvas.height = 2200;
      } else {
        canvas.width = 2200;
        canvas.height = 1700;
      }

      // Get the rendering context for the canvas
      var context = canvas.getContext('2d');

      // Draw the image onto the canvas
      context.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Convert the canvas to an image file
      var dataURL = canvas.toDataURL('image/png');

      // Save the image file
      var link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = dataURL;
      link.click();
    }
}

const map = new mapboxgl.Map({
  container: 'map',
  style: "mapbox://styles/hubertuz/" + mapData.style_id,
  center: [mapData.lng, mapData.lat],
  zoom: mapData.zoom,
  scrollZoom: true
});

function getDisplayLngLat() {
  return `${Math.abs(mapData.lng).toFixed(2)}° N, ${Math.abs(mapData.lat).toFixed(2)}° E`;
}

function init() {
  renderScaleButton();
  setMapData()
}

const geocoderSearch = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    placeholder: 'Enter search e.g. Lincoln Park',
    mapboxgl: mapboxgl
});

map.on('load', () => {
  let serarchInput = geocoderSearch.onAdd(map);
  $("#geocoderSearchWrap").append(serarchInput);
  map.addControl(new mapboxgl.NavigationControl());
  $(".mapboxgl-ctrl-geocoder--input").on({
    change: function(e) {
      mapData.frTitle=$(this).val();
      // $("#front-string").val(e.target.value);
      // $(".citymap-poster-name").text(e.target.value);
    }
  });
  // $("#front-string").on({
  //   change: function(change) {
  //     $(".city-map-postername").val($(this).val());
  //   }
  // })
});

// map.on('click', (event) => {
// console.log(event);
// });

$(document).ready(function(){

  map.on('moveend',() => {
  
    mapData = {
      ...mapData,
      lng: map.getCenter().lng,
      lat: map.getCenter().lat,
      zoom: map.getZoom(),
      bearing:  map.getBearing(),
    }
  
    setMapData()
  })

  $(".frameOption").on({
    click: function(){
      $(".frameOption").removeClass('active');
      $(this).addClass('active');
      let bgUrl = $(this).data('bgurl');
        $(".map-poster").css("background-image", `url(${bgUrl})`);
    },  
  });

  $(".stylecircleoption").on({
    click: function(){
      $(".stylecircleoption").removeClass('active');
      $(this).addClass('active');
      mapData.style_id=$(this).data('style_id')
      map.setStyle("mapbox://styles/hubertuz/" + mapData.style_id);
      setMapData()
    },  
  });

  $(".frameType").on({
    click: function(){
      $(".frameType").removeClass('active');
      $(this).addClass('active');
      
    },  
  });

  $("input[name=position-option]").on({
    change: function(e) {
      $(".citymap-poster-label").css("text-align",$(this).val());
    }
  });

  $("#front-string").on({
    keyup: function(e) {
      mapData.frTitle = $(this).val();
      setMapData();
    }
  });

  $("#back-string").on({
    keyup: function() {
      mapData.backTitle = $(this).val();
      setMapData();
    }
  });

  $("#color-picker").on('change', function(e) {
    $(".address-icon").css("color", $("#color-picker").val());
  });

  $(".btn-download").click(function(e) {
    e.preventDefault();
    
    const style_id = $(this).data('style_id');
    const fileName = $(this).data('file_name');
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milli = now.getMilliseconds();
    const fullDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}_${milli}_`;



    download(getImgLink(style_id), fullDate + fileName);
  });

  $(".size-type-div > .size-type-wrapper").click(function (e) {
    $('.size-type-div > .size-type-wrapper').removeClass('active');
    $(this).addClass('active');
    let viewType = $(this).data('value');
    mapData.config.viewType = viewType;
    mapData.config.scale = 0;
    renderScaleButton();
    setMapView(...config[viewType].viewSize);
  });
  
  $(".size-type-div > .size-unit-wrapper > .size-unit").click(function (e) {
    $('.size-type-div > .size-unit-wrapper > .size-unit').removeClass('active');
    $(this).addClass('active');
    let unit = $(this).data('value');
    mapData.config.unit = unit;
    mapData.config.scale = 0;
    renderScaleButton();
  });

  $(document).on("click", ".size-value > .size-type-wrapper", function (e) {
    $('.size-value > .size-type-wrapper').removeClass('active');
    $(this).addClass('active');
    let scale = $(this).data('value');
    mapData.config.scale = scale;
    renderScaleButton()
  });

  $('#accordion .collapse').on('shown.bs.collapse', function () {
    // Get the top position of the open accordion
    var offset = $(this).offset().top;
  
    // Smoothly scroll the page to the top of the open accordion
    $('.sidebar').animate({
      scrollTop: offset
    }, 500);
  });
  
  init();
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  });

  var icon = $('.address-icon');
  icon.on('dragstart', function(event) {
    // Set the drag data to the icon image source
    event.dataTransfer.setData('text', event.target.src);
  });

  // Add an event listener for the drop event on the map
  map.on('drop', function(event) {
    event.preventDefault();
    console.log('aa')

    // Get the drag data from the event
    var src = event.dataTransfer.getData('text');

    // Create a new mapbox marker with the icon
    var marker = new mapboxgl.Marker({
      draggable: true,
      element: new Image(32, 32).src = src
    });

    // Add the marker to the map at the dropped location
    marker.setLngLat(event.lngLat).addTo(map);

    // Add an event listener for the dragend event on the marker
    marker.on('dragend', function(event) {
      console.log('Marker dragged to', event.target.getLngLat());
    });
  });
})