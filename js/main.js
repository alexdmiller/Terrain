
(function() {
  var HEIGHT = 20;
  var WIDTH = 20;

  var scene;
  var camera;
  var renderer;


  function main() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    var heightmap = generateHeightmap(WIDTH, HEIGHT)

    var geometry = createGeometryFromHeightmap(heightmap);
    var material = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true } );
    var plane = new THREE.Mesh( geometry, material );
    scene.add(plane);

    plane.rotation.x = -1;
    camera.position.z = 10;

    stats = new Stats();
    document.body.appendChild( stats.dom );

    render();
  }

  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
    stats.update();
  }

  function createGeometryFromHeightmap(heightmap) {
    var geometry = new THREE.PlaneBufferGeometry(10, 10, heightmap.width, heightmap.height);
    var vertices = geometry.attributes.position.array;
    for (var i = 0; i < vertices.length; i++) {
      vertices[i * 3 + 2] = heightmap.data[i] * 0.1;
    }
    return geometry;
  }


  // Heightmap class

  var Heightmap = function(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height);
  };

  Heightmap.prototype.get = function(x, y) {
    return this.data[y * this.width + x];
  };

  Heightmap.prototype.set = function(x, y, value) {
    this.data[y * this.width + x] = value;
  };


  // Generation algorithm

  function generateHeightmap(width, height) {
    var map = new Heightmap(width, height);


    displace(map, 0, width - 1, 0, height - 1, 100);

    return map;
  }


  /**
   * @param map the Heightmap to perform displacement on
   * @param range the range of random values
   * @param lx x-position of the left edge
   * @param rx x-position of the right edge
   * @param ty y-position of the top edge
   * @param by y-position of the bottom edge
   */
  function displace(map, lx, rx, ty, by, range) {
    setMidpoint(map, range, [{x: lx, y: ty}, {x: rx, y: ty}]);
    setMidpoint(map, range, [{x: rx, y: ty}, {x: rx, y: by}]);
    setMidpoint(map, range, [{x: rx, y: by}, {x: lx, y: by}]);
    setMidpoint(map, range, [{x: lx, y: by}, {x: lx, y: ty}]);
    setMidpoint(map, range, [
      {x: lx, y: ty},
      {x: rx, y: ty},
      {x: rx, y: by},
      {x: lx, y: by}
    ]);
  }

  function setMidpoint(map, range, points) {
    var mx = 0;
    var my = 0;
    var value = 0;

    for (var i = 0; i < points.length; i++) {
      mx += points[i].x;
      my += points[i].y;
      value += map.get(points[i].x, points[i].y);
    }

    mx /= points.length;
    my /= points.length;
    value /= points.length;

    map.set(mx, my, value + Math.random() * range);
  }

  main();
})();
