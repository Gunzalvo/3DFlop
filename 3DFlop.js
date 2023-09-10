ThreeDFlop = 
{
	version:"0.9.5",
	
	vector3: function ( x, y, z )
	{
		this.x = x;
		this.y = y;
		this.z = z;
		this.add = function (vector3)
		{
			this.x += vector3.x; this.y += vector3.y; this.z += vector3.z;
			return this;
		};
		this.minus = function (vector3)
		{
			this.x -= vector3.x; this.y -= vector3.y; this.z -= vector3.z;
			return this;
		};
		this.multiply = function (scalar)
		{
			this.x *= scalar; this.y *= scalar; this.z *= scalar;
			return this;
		};
		this.magnitude = function ()
		{
			return Math.sqrt(Math.pow(this.x,2) + Math.pow(this.y,2) + Math.pow(this.z,2));
		};
		this.rotate = function (vector3)
		{
			var xrot = new ThreeDFlop.matrix3([1,            0,               0, 
											   0, Math.cos(vector3.x),Math.sin(vector3.x),
											   0,-Math.sin(vector3.x),Math.cos(vector3.x)]);
			
			var yrot = new ThreeDFlop.matrix3([Math.cos(vector3.y),      0,      Math.sin(vector3.y), 
											          0,                 1,              0,
											   -Math.sin(vector3.y),     0,      Math.cos(vector3.y)]);
			
			var zrot = new ThreeDFlop.matrix3([ Math.cos(vector3.z),  Math.sin(vector3.z),    0, 
											   -Math.sin(vector3.z),  Math.cos(vector3.z),    0,
											            0,                    0,              1 ]);
			
			var rot = xrot.multiply(yrot.multiply(zrot));
			return rot.vector3(this);
		};
		this.copy = function ()
		{
			return new ThreeDFlop.vector3(this.x, this.y, this.z);
		};
	},
	
	matrix3: function (a)
	{
		this.identity = [1,0,0,
						 0,1,0,
						 0,0,1];

		a == undefined ? this.elements = this.identity : this.elements = a;
		this.angles = [0,0,0];
		
		this.vector3 = function (v3)
		{
			var el = this.elements;
			return new ThreeDFlop.vector3(  el[0]*v3.x + el[3]*v3.y + el[6]*v3.z , 
											el[1]*v3.x + el[4]*v3.y + el[7]*v3.z , 
											el[2]*v3.x + el[5]*v3.y + el[8]*v3.z )
		};
		
		this.transpose = function ()
		{
			var matrix = new ThreeDFlop.matrix3(this.elements);
			var m3 = matrix.elements;
			var m = new ThreeDFlop.matrix3();
			var el = m.elements;
			el[0] = m3[0];  el[1] = m3[3];  el[2] = m3[6];
			el[3] = m3[1];  el[4] = m3[4];  el[5] = m3[7];
			el[6] = m3[2];  el[7] = m3[5];  el[8] = m3[8];
			return m;
		};
		
		this.multiply = function (matrix3)                                // [0,1,2]
		{                                                                 // [3,4,5]
			var m3 = matrix3.elements;                                    // [6,7,8]
			var el = this.elements;
			var m = new ThreeDFlop.matrix3();
			var mel = m.elements;
			mel[0] = el[0]*m3[0] + el[1]*m3[3] +  el[2]*m3[6];     mel[1] = el[0]*m3[1] + el[1]*m3[4] +  el[2]*m3[7];	    mel[2] = el[0]*m3[2] + el[1]*m3[5] +  el[2]*m3[8];	
			mel[3] = el[3]*m3[0] + el[4]*m3[3] +  el[5]*m3[6];     mel[4] = el[3]*m3[1] + el[4]*m3[4] +  el[5]*m3[7];    	mel[5] = el[3]*m3[2] + el[4]*m3[5] +  el[5]*m3[8];	
			mel[6] = el[6]*m3[0] + el[7]*m3[3] +  el[8]*m3[6];     mel[7] = el[6]*m3[1] + el[7]*m3[4] +  el[8]*m3[7];	    mel[8] = el[6]*m3[2] + el[7]*m3[5] +  el[8]*m3[8];
			this.elements = mel;
			return this;
		};
		
		this.add = function (matrix3)
		{
			var m3 = matrix3.elements;
			var el = this.elements;
			el[0] += m3[0]; el[1] += m3[1]; el[2] += m3[2];
			el[3] += m3[3]; el[4] += m3[4]; el[5] += m3[5];
			el[6] += m3[6]; el[7] += m3[7]; el[8] += m3[8];
			return this;
		};
	},
	
	object: function (vector3)
	{
		this.rotation = new ThreeDFlop.matrix3();
		vector3.constructor.name !== "vector3" ? this.position = new ThreeDFlop.vector3(0,0,0) : this.position = vector3;
		this.toLocalVector = function (vector3)
		{
			//Llevar del espacio mundo al espacio local
			var wv = vector3.copy();
			wv.minus(this.position);
			return this.rotation.transpose().vector3(wv);
		};
		this.toWorldVector = function (vector3)
		{
			//Llevar del espacio local al espacio mundo
			return this.rotation.vector3(vector3).add(this.position);
		};
		this.rotate = function (vector3)
		{
			var xrot = new ThreeDFlop.matrix3([1,          0,                 0, 
											   0,Math.cos(vector3.x),Math.sin(vector3.x),
											   0,-Math.sin(vector3.x),Math.cos(vector3.x)]);
			
			var yrot = new ThreeDFlop.matrix3([Math.cos(vector3.y),     0,     -Math.sin(vector3.y), 
											          0,                 1,              0,
											   Math.sin(vector3.y),      0,      Math.cos(vector3.y)]);
			
			var zrot = new ThreeDFlop.matrix3([Math.cos(vector3.z), Math.sin(vector3.z),    0, 
											   -Math.sin(vector3.z),  Math.cos(vector3.z),    0,
											           0,                   0,               1 ]);
			
			var rot = xrot.multiply(zrot.multiply(yrot));
			rot.angles = [ vector3.x, vector3.y, vector3.z ];
			this.rotation = rot;
		};
	},
	
	mesh: function (pos)
	{
		this.visible = false;
		this.vertices = [];
		this.faces = [];
		this.cache = [];
		
		this.checkConections = function()
		{
			if(this.faces.length >0)
			{
				for(v=0;v<this.vertices.length;v++)
				{
					var sharedFaces = [];
					
					for(f=0;f<this.faces.length;f++)
					{
						if(this.faces[f].vertices.includes(v)) sharedFaces.push(f);
					}
					
					for(sf=0;sf<sharedFaces.length;sf++)
					{
						var pos = this.faces[sharedFaces[sf]].vertices.indexOf(v);
						var totvert = this.faces[sharedFaces[sf]].vertices.length;
						
						if(this.vertices[v].conections.length == 0)
						{
							this.faces[sharedFaces[sf]].vertices[pos+1] == undefined ? 
							this.vertices[v].conections.push(this.faces[sharedFaces[sf]].vertices[0]) :
							this.vertices[v].conections.push(this.faces[sharedFaces[sf]].vertices[pos+1]);
							
							this.faces[sharedFaces[sf]].vertices[pos-1] == undefined ? 
							this.vertices[v].conections.push(this.faces[sharedFaces[sf]].vertices[totvert-1]) : 
							this.vertices[v].conections.push(this.faces[sharedFaces[sf]].vertices[pos-1]);
						}
						else
						{
							if(this.faces[sharedFaces[sf]].vertices[pos+1] !== undefined)
							{
								if(!this.vertices[v].conections.includes(this.faces[sharedFaces[sf]].vertices[pos+1])) this.vertices[v].conections.push(this.faces[sharedFaces[sf]].vertices[pos+1]);
							}
							else
							{
								if(!this.vertices[v].conections.includes(this.faces[sharedFaces[sf]].vertices[0])) this.vertices[v].conections.push(this.faces[sharedFaces[sf]].vertices[0]);
							}
							
							if(this.faces[sharedFaces[sf]].vertices[pos-1] !== undefined)
							{
								if(!this.vertices[v].conections.includes(this.faces[sharedFaces[sf]].vertices[pos-1])) this.vertices[v].conections.push(this.faces[sharedFaces[sf]].vertices[pos-1]);
							}
							else
							{
								if(!this.vertices[v].conections.includes(this.faces[sharedFaces[sf]].vertices[totvert-1])) this.vertices[v].conections.push(this.faces[sharedFaces[sf]].vertices[totvert-1]);
							}
						}
					}
				}
			}
		};
		
		this.createCache = function()
		{
			for(var u = 0; u<this.faces.length ; u++)
			{
				if (u == 0)
				{
					for (var v = 0 ; v < this.faces[0].vertices.length ; v++)
					{
						if (this.cache[0] == undefined) this.cache[0] = [];
						this.cache[0].push(this.faces[0].vertices[v]);
					}
				}
				else
				{
					var totfacevert = this.faces[u].vertices.length;
					
					for(var v = 0 ; v < totfacevert ; v++)
					{
						for(var f = u-1; f >= 0 ; f--)
						{	
							var vtx = this.faces[u].vertices;
							if ( vtx[v+1] == undefined ) vtx[v+1] = vtx[0];
							if ( this.faces[f].vertices.includes(vtx[v]) && this.faces[f].vertices.includes(vtx[v+1]) )
							{
								f = -1;
							}
							else if( f == 0)
							{
								if( this.cache[u] == undefined ) this.cache[u] = [];
								this.cache[u].push(this.faces[u].vertices[v]);
							}
							if (vtx.length > totfacevert) vtx.pop();
						}
					}
				}
			}
		};
		
		this.addVertices = function (vert) 
		{
			var totalVertices = vert.length;
			for(var i = 0 ; i < totalVertices ; i++)
			{
				vert[i] = new ThreeDFlop.vertex(vert[i].x, vert[i].y, vert[i].z);
			}
			this.vertices = this.vertices.concat(vert);
			
			this.checkConections();
			if(this.faces.length > 0) this.createCache();
		};
		
		this.addFaces = function (faces)
		{
			var totalFaces = faces.length;
			for(var i = 0 ; i < totalFaces ; i++ )
			{
				if(faces[i].constructor.name == "Array") faces[i] = new ThreeDFlop.face(faces[i]);
			}
			this.faces = this.faces.concat(faces);
			
			for (f=0;f<this.faces.length;f++)
			{
				var totvert = this.faces[f].vertices.length;
				for (v=0;v<this.faces[f].vertices.length;v++)
				{
					for(var fd = 0; fd < this.faces.length ; fd++)
					{
						if(f!==fd) 
						{	
							if(this.faces[f].vertices[v+1] == undefined) this.faces[f].vertices[v+1] = this.faces[f].vertices[0];
							if(this.faces[fd].vertices.includes(this.faces[f].vertices[v]) && this.faces[fd].vertices.includes(this.faces[f].vertices[v+1]))
							{
								this.faces[f].adjacent.push(fd);
								if(this.faces[f].vertices.length>totvert) this.faces[f].vertices.pop();
								break;
							}
							if(this.faces[f].vertices.length>totvert) this.faces[f].vertices.pop();
						}
					}
				}
			}
			
			this.checkConections();
			if(this.vertices.length > 0) this.createCache();
		}
		
		var position;
		pos !== undefined ? position = new ThreeDFlop.vector3( pos[0], pos[1], pos[2] ) : position = new ThreeDFlop.vector3( 0, 0, 0 );
		var object = new ThreeDFlop.object( position );
		return Object.assign(this, object);
	},
	
	vertex: function (x,y,z)
	{
		this.x = x;
		this.y = y;
		this.z = z;
		this.screenx = undefined;
		this.screeny = undefined;
		this.visible = false;
		this.conections = [];
	},
	
	face: function(vertices)
	{
		this.normal = [];
		this.vertices = [];
		this.adjacent = [];
		if(vertices !== undefined) for(i in vertices) this.vertices.push(vertices[i]);
	},
	
	box: function (width, heigth, len, pos)
	{
		var box = new ThreeDFlop.mesh(pos);
		var vertices =
		[
			{x:-width/2,y:-heigth/2,z:-len/2} , {x:width/2,y:-heigth/2,z:-len/2} , {x:width/2,y:heigth/2,z:-len/2},{x:-width/2,y:heigth/2,z:-len/2},
			{x:-width/2,y:-heigth/2,z:len/2} , {x:width/2,y:-heigth/2,z:len/2} , {x:width/2,y:heigth/2,z:len/2},{x:-width/2,y:heigth/2,z:len/2}
		]
		var faces = 
		[
			[3,2,1,0], [4,5,6,7], [0,1,5,4], [2,3,7,6], [6,5,1,2], [0,4,7,3]
		]
		box.addVertices(vertices);
		box.addFaces(faces);
		return box;
	},
	
	grid: function (width, len)
	{
		var i, f, c, w, row;
		var wmid = Math.floor(width/2);
		var lmid = Math.floor(len/2);
		var vertices = [];
		var faces = [];
		var grid = new ThreeDFlop.mesh([0,0,0]);
		
		for(i=0,row=0,col=0; i < (len+1)*(width+1) ;i++,col++)
		{
			if(i!=0) if(i%(width+1) == 0){ row++; col=0;}
			vertices[i] = {x:-wmid+col,y:0,z:-lmid+row};
		}
		
		c = 0;
		
		for(f=0; f < len ;f++)
		{
			for(w=0; w<width ; w++,c++)
			{
				faces[c] = [c,c+1,width+c+2,width+c+1];
			}
			c++;
		}
		
		faces = faces.filter(function(index){return index});
		grid.addVertices(vertices);
		grid.addFaces(faces);
		return grid;
	},
	
	camera: function (pos, fov, res)
	{
		this.id = undefined;
		this.fov = fov;
		this.radfov = Math.PI*this.fov/180;
		
		if(document.getElementById("FPviewport") === null) 
		{
			this.canvas = document.createElement("CANVAS");
			var att = document.createAttribute("id");
			att.value = "FPviewport";
			this.canvas.setAttributeNode(att);
			res !== undefined && res.constructor.name == "Array" ? this.resolution = res : this.resolution = [1080,540];
			var width = document.createAttribute("width");
			width.value = this.resolution[0];
			var heigth = document.createAttribute("heigth");
			heigth.value = this.resolution[1];
			this.canvas.setAttributeNode(width);
			this.canvas.setAttributeNode(heigth);
		}
		else
		{
			this.canvas = document.getElementById("FPviewport");
			this.resolution = [this.canvas.width,this.canvas.height];
		}
		
		this.active = true;
		this.near = 2;
		this.far = 40;
		this.fog = false;
		
		var position;
		pos !== undefined ? position = new ThreeDFlop.vector3( pos[0], pos[1], pos[2] ) : position = new ThreeDFlop.vector3( 0, 0, 0 );
		var object = new ThreeDFlop.object( position );
		return Object.assign(this, object);
	},
	
	scene: function ()
	{
		this.objects = [];
		this.cameras = [];
		this.activeCamera = undefined;
		
		this.addObject = function (obj)
		{
			this.objects = this.objects.concat(obj);
		}
		
		this.addCamera = function (cam)
		{
			if(cam.active) this.activeCamera = cam;
			cam.id = this.cameras.length;
			this.cameras= this.cameras.concat(cam);
			for(c in this.cameras) if(this.cameras[c].id!==cam.id) this.cameras[c].active = false;
		}
		
		this.setActiveCamera = function (cam)
		{
			for(c in this.cameras) if(this.cameras[c].id!==cam.id) this.cameras[c].active = false;
			this.cameras[cam.id].active = true;
			this.activeCamera = cam;
		}
	},
	
	openOBJ: function (event) 
	{
		var input = event.target || event;
		var scene = eval(input.getAttribute("scene")) || false;
		var reader = new FileReader();
		var filename = input.files[0].name;
		
		reader.onload = function()
		{
			var text = reader.result;
			var splitedText = text.split("\n");
			var totalLines = splitedText.length;
			var obj = new ThreeDFlop.mesh();
			var fnormals = [];
			var faces = [];
			
			for ( var i = 0 ; i < totalLines ; i ++)
			{
				if (splitedText[i].match(/v /))
				{
					var cords = splitedText[i].split(" ");
					var vert = new ThreeDFlop.vertex( parseFloat(cords[1]), parseFloat(cords[2]), parseFloat(cords[3]) );
					obj.vertices.push(vert);
				}
				else if (splitedText[i].match(/f /))
				{
					var cords = splitedText[i].split(" ");
					var totFaceVert = cords.length;
					var face = new ThreeDFlop.face();
					
					for( var u = 1 ; u < totFaceVert ; u++)
					{	
						var vertNum = cords[u].split("//");
						vertNum[0] = parseInt(vertNum[0]);
						vertNum[0]--;
						face.vertices.push(vertNum[0]);
					}
					faces.push(face);
				}
				else if(splitedText[i].match(/vn /))
				{
					var fnc = splitedText[i].split(" ");
					var face_n = [ parseFloat(fnc[1]) , parseFloat(fnc[2]) ,parseFloat(fnc[3]) ];
					fnormals.push(face_n);
				}
			}

			obj.addFaces(faces);
			for( n in obj.faces) obj.faces[n].normal = fnormals[n];
			
			if(scene)
			{
				scene.addObject(obj);
				ThreeDFlop.render(scene);
			}
		};
		
		if(filename.endsWith(".obj"))
		{
			reader.readAsText(input.files[0]);
		}
		else
		{
			alert("El formato del objeto a importar debe ser .obj");
		}
	},
	
	canvasRender: function (scene)
	{
		var camera = scene.activeCamera;
		var hcenter = camera.resolution[0]/2;
		var vcenter = camera.resolution[1]/2;
		var canvas = camera.canvas;
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0,0,hcenter*2,vcenter*2);
		
		var totobj = scene.objects.length;	
		for ( var i=0 ; i<totobj; i++ )
		{	
			if (scene.objects[i].visible) 
			{ 
				var object = scene.objects[i];
				var faces = object.faces;
				var totfaces = faces.length;
				
				for(var c = 0; c < object.cache.length; c++)
				{
					if(object.cache[c]!== undefined) for(var p = 0; p < object.cache[c].length; p++)
					{
						var vtx = faces[c].vertices;
						var totfacevert = vtx.length;
						var v = vtx.indexOf(object.cache[c][p]);
						if ( vtx[v+1] == undefined ) vtx[v+1] = vtx[0];
						ctx.strokeStyle = "rgb(204, 0, 102)";
						
						var dx = Math.pow(object.vertices[vtx[v]].screenx - object.vertices[vtx[v+1]].screenx, 2);
						var dy = Math.pow(object.vertices[vtx[v]].screeny - object.vertices[vtx[v+1]].screeny, 2);
						
						var d = Math.sqrt( dx + dy );
						if( d > 4 ) { // Mejora el rendimiento en relacion a la distancia al objeto.
						
							if ( object.vertices[vtx[v]].visible || object.vertices[vtx[v+1]].visible )
							{   
								ctx.beginPath();
								ctx.moveTo( hcenter + object.vertices[vtx[v]].screenx , vcenter - object.vertices[vtx[v]].screeny );
								ctx.lineTo( hcenter + object.vertices[vtx[v+1]].screenx , vcenter - object.vertices[vtx[v+1]].screeny );
								ctx.stroke();
							}
							
						}
						
						if (vtx.length > totfacevert) vtx.pop();
					}
				}	
			}
		}
	},
	
	render: function (scene)
	{		
		var camera = scene.activeCamera;
		var fov = camera.fov/2;
		var radfov = Math.PI*fov/180;
		var theta = Math.PI - radfov;
		var width = camera.resolution[0];
		var a = width/2/Math.sin(radfov);
		var r = 4*a*(Math.sqrt(Math.pow(Math.cos(theta),2)+3) - Math.cos(theta))/6; // Resolución simplificada de la ecuación cuadrática originada por el teorema de los cosenos.
		var totobj = scene.objects.length;
		var near = camera.near;
		var far = camera.far;
		var hcenter = camera.resolution[0]/2;
		var vcenter = camera.resolution[1]/2;
		
		for ( var i = 0 ; i < totobj ; i++ )
		{
			vis = 0;
			var object = scene.objects[i];
			var totvertex = object.vertices.length;
			for ( var u = 0 ; u<totvertex ; u++)
			{
				var x,y,z;
				var vtx = new ThreeDFlop.vector3(object.vertices[u].x, object.vertices[u].y, object.vertices[u].z);
				
				vlp = camera.toLocalVector(object.toWorldVector(vtx));
				x = vlp.x; 
				y = vlp.y; 
				z = vlp.z;
				
				var alpha = Math.atan(-x/z);
				var beta = Math.PI - alpha;
				var gamma = Math.asin(Math.sin(beta)/2);
				var phi = Math.PI - beta - gamma;
				var v = Math.sin(phi) * r/Math.sin(beta);
				var screenx = Math.sin(alpha) * v;
						
				alpha = Math.atan(y/z);
				beta = Math.PI - alpha;
				gamma = Math.asin(Math.sin(beta)/2);
				phi = Math.PI - beta - gamma;
				v = Math.sin(phi) * r/Math.sin(beta);
				var screeny = Math.sin(alpha) * v;
				
				if( Math.abs(screenx) > hcenter || Math.abs(screeny) > vcenter || z < near || z > far) {
					object.vertices[u].visible = false;
					vis++;
				}
				else
				{
					object.vertices[u].visible = true;
					vis--;
				}
				
				object.visible = vis == totvertex ?  false : true;
				
				object.vertices[u].screenx = screenx;
				object.vertices[u].screeny = screeny;
			}
		}
		ThreeDFlop.canvasRender(scene);
	}
};
window.addEventListener("keypress", executeAction);
window.addEventListener("load", start);

var camara;
var escena;
var stop = false;
var framec = 0;
var debug = true;

function start(e)
{
	escena = new ThreeDFlop.scene();
	camara = new ThreeDFlop.camera([0,0,-10],60);
	
	camara.position = new ThreeDFlop.vector3(11,7,-12);
	camara.rotate( new ThreeDFlop.vector3(0.41,-0.8, 0) );

	gizmo = new ThreeDFlop.mesh();
	ejes = [ {x:0,y:0,z:0},{x:1,y:0,z:0},{x:0,y:1,z:0},{x:0,y:0,z:1} ];
	faces = [ [0,1],[0,2],[0,3] ];
	gizmo.addVertices(ejes);
	gizmo.addFaces(faces);

	escena.addCamera(camara);
	escena.addObject(new ThreeDFlop.box(1, 1, 5, [0,0,0]));
	escena.addObject(new ThreeDFlop.grid(50,50));
	escena.addObject(gizmo);
	
	if (debug) {
		camara.canvas.addEventListener("mousemove", updatemousep);
		camara.canvas.addEventListener("wheel", updatemousep);
		camara.canvas.addEventListener("mouseleave", hidemousep);
		camara.canvas.addEventListener("mouseenter", showmousep);
	}
	
	let mousedown = function(e) {
		window.addEventListener("mousemove", rotateView, true);
		
		let mouseup = function(e) {
			window.removeEventListener("mousemove", rotateView, true);
		}
		
		window.addEventListener("mouseup", mouseup, {once:true}); 
	}
	window.addEventListener("mousedown", mousedown, true);
	
	window.setInterval(framecount, 1000);
	animate(e);
}

function updatemousep(e)
{
	var mouse = document.getElementById("mpos");
	var canvas = document.getElementById("FPviewport");
	
	let xPos = e.clientX - canvas.width/2 - canvas.offsetLeft;
	let yPos = -e.clientY - window.scrollY + canvas.height/2;
	mouse.style.left = e.clientX + 20 +"px";
	mouse.innerHTML ="X: " + xPos + "px / Y: " + yPos + "px";
	mouse.style.top = e.clientY + window.scrollY + 10 + "px";
}

function hidemousep(e)
{
	var mouse = document.getElementById("mpos");
	mouse.style.display="none";
}

function showmousep(e)
{
	var mouse = document.getElementById("mpos");
	mouse.style.display="block";
}

function framecount()
{
	var p = document.getElementById("frames");
	p.innerHTML = "FPS = " + framec;
	framec=0;
}

function animate(e)
{
	var rotx = escena.objects[0].rotation.angles[0];
	var roty = escena.objects[0].rotation.angles[1];
	var rotz = escena.objects[0].rotation.angles[2];
	var rotval = 0.01;
	
	roty += rotval;
	rotz += rotval;
	
	var rot = new ThreeDFlop.vector3(rotx,roty,rotz);
	escena.objects[0].rotate(rot);
	
	framec++;
	
	ThreeDFlop.render(escena);
	if(!stop) requestAnimationFrame(animate);
}

function rotateView(e) {
	var camara = escena.activeCamera;
	var dx = e.movementX * 0.005;
	var dy = e.movementY * 0.005;
	
	var rotx = camara.rotation.angles[0];
	var roty = camara.rotation.angles[1];
	
	var rot = new ThreeDFlop.vector3(rotx + dy, roty - dx, 0);
	camara.rotate(rot);
}

function executeAction(e)
{
	var camara = escena.activeCamera;
	var rotval = 0.01;
	var val = 0.2;
	
	var rotx = camara.rotation.angles[0];
	var roty = camara.rotation.angles[1];
	var rotz = camara.rotation.angles[2];
	
	switch(e.key)
	{
		case "v":
			rotz += rotval;
			var rot = new ThreeDFlop.vector3(rotx,roty,rotz);
			camara.rotate(rot);
			break;
		case "b":
			rotz -= rotval;
			var rot = new ThreeDFlop.vector3(rotx,roty,rotz);
			camara.rotate(rot);
			break;
		case "a":
			var lvec = new ThreeDFlop.vector3(val,0,0);
			camara.position = camara.rotation.vector3(lvec).add(camara.position);
			break;
		case "d":
			var lvec = new ThreeDFlop.vector3(-val,0,0);
			camara.position = camara.rotation.vector3(lvec).add(camara.position);
			break;
		case "q":
			var lvec = new ThreeDFlop.vector3(0,val,0);
			camara.position = camara.rotation.vector3(lvec).add(camara.position);
			break;
		case "e":
			var lvec = new ThreeDFlop.vector3(0,-val,0);
			camara.position = camara.rotation.vector3(lvec).add(camara.position);
			break;
		case "s":
			var lvec = new ThreeDFlop.vector3(0,0,-val);
		    camara.position = camara.rotation.vector3(lvec).add(camara.position);
			break;
		case "w":
			var lvec = new ThreeDFlop.vector3(0,0,val);
			camara.position = camara.rotation.vector3(lvec).add(camara.position);
			break;
		case "z": 
			if(camara.fov < 180)camara.fov += 1;
			break;
		case "c":
			if(camara.fov > 1) camara.fov -= 1;
			break;
		case "x":
			camara.fov = 60;
			break;
		case "o":
			if(stop) requestAnimationFrame(animate);
			stop = !stop;
	}
	
	var p = document.getElementById("debug");
	p.innerHTML = "FOV = " + camara.fov;
	
	if(stop){ThreeDFlop.render(escena); framec++;}
}