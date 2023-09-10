ThreeDFlop = 
{
	version:"0.4.5", //Cambios: - Nuevo sistema de proyección para el renderizado, más sencillo. 
					//			- Agregada una función para hacer cajas facilmente.
					//  		- [En desarrollo] Mejor manejo de objetos que pasan por detrás de la posición de la cámara.
	
	
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
	
	box: function (width, heigth, len, pos, scene)
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
		scene.addObject(box);
		return box;
	},
	
	grid: function (width, len, escena)
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
		escena.addObject(grid);
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
			res !== undefined && res.constructor.name == "Array" ? this.resolution = res : this.resolution = [window.innerWidth,window.innerHeight];
			var width = document.createAttribute("width");
			width.value = this.resolution[0];
			var height = document.createAttribute("height");
			height.value = this.resolution[1];
			this.canvas.setAttributeNode(width);
			this.canvas.setAttributeNode(height);
			document.body.appendChild(this.canvas);
		}
		else
		{
			this.canvas = document.getElementById("FPviewport");
			this.resolution = [this.canvas.width,this.canvas.height];
		}
		this.active = true;
		this.near = 2;
		
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
		var hcenter = scene.activeCamera.resolution[0]/2;
		var vcenter = scene.activeCamera.resolution[1]/2;
		var canvas = scene.activeCamera.canvas;
		var ctx = canvas.getContext("2d");
		ctx.clearRect(0,0,hcenter*2,vcenter*2);
		var grd = ctx.createLinearGradient(0, vcenter*2, 0, 0);
		grd.addColorStop(0, "black");
		grd.addColorStop(1, "lightblue");

		ctx.fillStyle = grd;
		ctx.fillRect(0, 0, hcenter*2, vcenter*2);

		
		var totobj = scene.objects.length;	
		for ( var i=0 ; i<totobj; i++ )
		{
			if (scene.objects[i].visible) 
			{ 
				var faces = scene.objects[i].faces;
				var object = scene.objects[i];
				var totfaces = faces.length;
				ctx.strokeStyle = scene.objects[i].color || "#11ff00";
				
				for(var c = 0; c < object.cache.length; c++)
				{
					
					if(object.cache[c]!== undefined) for(var p = 0; p < object.cache[c].length; p++)
					{
						var vtx = faces[c].vertices;
						var totfacevert = vtx.length;
						var v = vtx.indexOf(object.cache[c][p]);
						if ( vtx[v+1] == undefined ) vtx[v+1] = vtx[0];
						if (object.vertices[object.cache[c][p]].visible)
						{
							if(object.vertices[vtx[v+1]].hasOwnProperty("proyections"))
							{
								ctx.beginPath();
								ctx.moveTo( hcenter + object.vertices[vtx[v]].screenx , vcenter - object.vertices[vtx[v]].screeny );
								ctx.lineTo( hcenter + object.vertices[vtx[v+1]].proyections[vtx[v]].screenx , vcenter - object.vertices[vtx[v+1]].proyections[vtx[v]].screeny );
								ctx.stroke();
							}
							else
							{
								ctx.beginPath();
								ctx.moveTo( hcenter + object.vertices[vtx[v]].screenx , vcenter - object.vertices[vtx[v]].screeny );
								ctx.lineTo( hcenter + object.vertices[vtx[v+1]].screenx , vcenter - object.vertices[vtx[v+1]].screeny );
								ctx.stroke();
							}
						}
						else if(object.vertices[vtx[v]].hasOwnProperty("proyections"))
						{	
							if(object.vertices[vtx[v+1]].visible)
							{
								ctx.beginPath();
								ctx.moveTo( hcenter + object.vertices[vtx[v]].proyections[vtx[v+1]].screenx , vcenter - object.vertices[vtx[v]].proyections[vtx[v+1]].screeny );
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
		var planedist = camera.near;
		
		for ( var i = 0 ; i < totobj ; i++ )
		{
			var vis = 0;
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
				
				if( planedist >= z )
				{
					if(object.vertices[u].hasOwnProperty("proyections")) delete object.vertices[u].proyections;				
					object.vertices[u].visible = false;
					
					var conections = object.vertices[u].conections;
					var totconec = conections.length;
					
					for(var j = 0; j < totconec ;j++)
					{
						ver = object.vertices[conections[j]];
						vert = new ThreeDFlop.vector3( ver.x, ver.y, ver.z );
						
						vpp = camera.toLocalVector(object.toWorldVector(vert));
						
						var zP = planedist;
						if( vpp.z > zP)
						{
							var xP = ( (vpp.x - x) / (vpp.z - z)  * (zP - z) ) + x;
							var yP = ( (zP - vpp.z) / (z - vpp.z) * (y - vpp.y) ) + vpp.y;
							var point = new ThreeDFlop.vertex(xP, yP, zP);		
								
							var alpha = Math.atan(-xP/zP);
							var beta = Math.PI - alpha;
							var gamma = Math.asin(Math.sin(beta)/2);
							var phi = Math.PI - beta - gamma;
							var v = Math.sin(phi) * r/Math.sin(beta);
							point.screenx = Math.sin(alpha) * v;
								
							alpha = Math.atan(yP/zP);
							beta = Math.PI - alpha;
							gamma = Math.asin(Math.sin(beta)/2);
							phi = Math.PI - beta - gamma;
							v = Math.sin(phi) * r/Math.sin(beta);
							point.screeny = Math.sin(alpha) * v;
								
							if(!object.vertices[u].hasOwnProperty("proyections")) Object.assign(object.vertices[u], {proyections:[]} );
							object.vertices[u].proyections[ conections[j] ] = point;
						};
					}
		
					vis++;
				}
				else
				{
					if(object.vertices[u].hasOwnProperty("proyections")) delete object.vertices[u].proyections;	
					object.vertices[u].visible = true;
					vis--;

					//posicion horizontal
					var alpha = Math.atan(-x/z);
					var beta = Math.PI - alpha;
					var gamma = Math.asin(Math.sin(beta)/2);
					var phi = Math.PI - beta - gamma;
					var v = Math.sin(phi) * r/Math.sin(beta);
					object.vertices[u].screenx = Math.sin(alpha) * v;
					
					//posicion vertical
					alpha = Math.atan(y/z);
					beta = Math.PI - alpha;
					gamma = Math.asin(Math.sin(beta)/2);
					phi = Math.PI - beta - gamma;
					v = Math.sin(phi) * r/Math.sin(beta);
					object.vertices[u].screeny = Math.sin(alpha) * v;
					
					vis == totvertex ? object.visible = false : object.visible = true;
				}
			}
		}
		ThreeDFlop.canvasRender(scene);
	}
};

window.addEventListener("keypress", movecamera);
//window.addEventListener("load", animate);

angle = -0.75;

file = document.getElementById("file");
audio = document.getElementById("audio");

file.onchange = function() 
{
	var files = this.files;
	audio.src = URL.createObjectURL(files[0]);
	audio.load();
	audio.play();
	var context = new AudioContext();
	var src = context.createMediaElementSource(audio);
	analyser = context.createAnalyser();

	src.connect(analyser);
	analyser.connect(context.destination);

	analyser.fftSize = 256;

	bufferLength = analyser.frequencyBinCount;

	dataArray = new Uint8Array(bufferLength);

	bars = [];
	var WIDTH = Math.sqrt(grilla.faces.length);
	totbars = 70;
	steps = parseInt((bufferLength)/totbars);
	barw = WIDTH/totbars;
	for(var i=1; i <= totbars; i++)
	{
		xpos = -WIDTH/2 -barw/2 + barw*i;
		bar = new ThreeDFlop.box(barw,0,barw,[xpos,0,0],escena);
		bars.push(bar);
	}
	animate();
}

function animate()
{
	var rotx = escena.activeCamera.rotation.angles[0];
	var roty = escena.activeCamera.rotation.angles[1];
	var rotz = escena.activeCamera.rotation.angles[2];
	
	var xpos = escena.activeCamera.position.x;
	var zpos = escena.activeCamera.position.z;
	
	var radius = Math.sqrt(Math.pow(xpos,2) + Math.pow(zpos,2));
	
	angle += 0.004;
	
	escena.activeCamera.position.x = radius * Math.cos(angle);
	escena.activeCamera.position.z = radius * Math.sin(angle);
	
	
	var rotval = -0.004;
	
	roty += rotval;
	
	var rot = new ThreeDFlop.vector3(rotx,roty,rotz);
	escena.activeCamera.rotate(rot);
  
	analyser.getByteFrequencyData(dataArray);
    for (var i = 0; i < bars.length; i++) 
	{
		bars[i].vertices[3].y = dataArray[i*steps]/25;
		bars[i].vertices[2].y = dataArray[i*steps]/25;
		bars[i].vertices[6].y = dataArray[i*steps]/25;
		bars[i].vertices[7].y = dataArray[i*steps]/25;
		bars[i].color = "rgb(" + Math.sin(dataArray[i*steps]/60)*255 + "," + 0 + "," + (255-Math.cos(dataArray[i*steps]/40)*255) + ")";
    }
	grilla.color = "rgb(" + 0 + "," + 0 + "," + Math.sin(dataArray[64]/50)*255 + ")";
	
	ThreeDFlop.render(escena);
	requestAnimationFrame(animate);
}

function movecamera(e)
{
	var camvec = camara.position;
	var rotval = 0.01;
	var val = 0.05;
	
	//var deltaTime = 42;
	
	var rotx = camara.rotation.angles[0];
	var roty = camara.rotation.angles[1];
	var rotz = camara.rotation.angles[2];
	
	switch(e.key)
	{
			case "r":
			roty += rotval;
			break;
		case "t":
			roty -= rotval;
			break;
		case "f":
			rotx += rotval;
			break;
		case "g":
			rotx -= rotval;
			break;
		case "v":
			rotz += rotval;
			break;
		case "b":
			rotz -= rotval;
	}
	
	var rot = new ThreeDFlop.vector3(rotx,roty,rotz);
	camara.rotate(rot);
	
	switch(e.key)
	{
		case "a":
			var lvec = new ThreeDFlop.vector3(val,0,0);
			camvec = camara.rotation.vector3(lvec).add(camara.position);
			break;
		case "d":
			var lvec = new ThreeDFlop.vector3(-val,0,0);
			camvec = camara.rotation.vector3(lvec).add(camara.position);
			break;
		case "w":
			var lvec = new ThreeDFlop.vector3(0,val,0);
			camvec = camara.rotation.vector3(lvec).add(camara.position);
			break;
		case "s":
			var lvec = new ThreeDFlop.vector3(0,-val,0);
			camvec = camara.rotation.vector3(lvec).add(camara.position);
			break;
		case "q":
			var lvec = new ThreeDFlop.vector3(0,0,-val);
		    camvec = camara.rotation.vector3(lvec).add(camara.position);
			break;
		case "e":
			var lvec = new ThreeDFlop.vector3(0,0,val);
			camvec = camara.rotation.vector3(lvec).add(camara.position);
			break;
		case "z":
			camara.fov += 1;
			break;
		case "c":
			if(camara.fov > 1) camara.fov -= 1;
			break;
		case "x":
			camara.fov = 60;
	}
	//Mover la camara en espacio local
	camara.position = camvec;
}

camara = new ThreeDFlop.camera([14.204752666643111,7.830249260297245,-14.749310702442578],120);
escena = new ThreeDFlop.scene();
escena.addCamera(camara);
camara.rotation.angles = [0.2,-0.8,0];
camara.rotation.elements = [0.6967067093471654,        0,           0.7173560908995228,
						   -0.28594482931899134,0.9171208228166051,0.27771379321511225,
						   -0.6579022083382737,-0.3986093279844229,0.6389642305383216  ];

grilla = new ThreeDFlop.grid(20,20,escena);