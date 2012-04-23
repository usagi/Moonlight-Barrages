if (!wrp) var wrp = {};

//WRP_DEBUG_BEGIN
if (!wrp.etc) wrp.etc = {};
//wrp.etc.log_off = true;
if (!wrp.log){
  if (!wrp.etc.log_off) {
    wrp.log = function(a, b){
      var t = wrp.log_stack[wrp.log_stack.length - 1];
      var i = '';
      for(var n = wrp.log_stack.length - 2; n; --n)
        i += '  ';
      console.log(i + '[' + new Date().getTime() + ':' + t.name + '] ', a, t.object);
    };
    wrp.log_push = function(n, o){
      wrp.log_stack.push( {name:n, object:o} );
      wrp.log('>>> push >>>');
    };
    wrp.log_pop = function(){
      wrp.log('<<< pop  <<<');
      wrp.log_stack.pop();
    };
    wrp.log_stack = [{name:void 0,object:void 0}];
  }else
    wrp.log = function(){};
}
//WRP_DEBUG_END

wrp.moonlight_barrages = (function(){

  var staging_object = function(moonlight_barrages){
    this.document_object = document.createElement('div');
    moonlight_barrages.tmp.dom.stage.appendChild(this.document_object);
    this.moonlight_barrages = moonlight_barrages;
    this.id = moonlight_barrages.tmp.objects.length;
    moonlight_barrages.tmp.objects.push(this);
    this.mutate();
  };
  staging_object.prototype = {
    moonlight_barrages: null,
    mutate: function(n){
      //wrp.log_push('mutate' ,this);
      //wrp.log('n: ' + n);
      var a = true;
      switch(n){
      case 1000: // player
        this.document_object.setAttribute('class', 'p_00');
        this.tmp = {
          last_shoot_time: 0,
          shoot: function(t){
            var shoots_per_second = 8;
            // slow mode specialize
            if(t.moonlight_barrages.tmp.input_status.k){
              shoots_per_second *= 1.75;
            }
            if(t.time < this.last_shoot_time + 1 / shoots_per_second){
              return;
            }
            this.last_shoot_time = t.time;
            var o = t.moonlight_barrages.pop_inactive_object();
            if(o){
              o.mutate(4000);
              o.tmp.master = t;
              o.px = t.px;
              o.py = t.py - 10;
              o.vx = 0;
              o.vy = -700;
            }
          },
        };
        this.initialize(250,550,0,0,0,0,0,function(){
          //wrp.log_push('player/update_hook', this);
          this.ax = -this.vx * 3;
          this.ay = -this.vy * 3;
          var s = this.moonlight_barrages.tmp.input_status;
          var ap = 500;
          // slow mode specialize
          if(s.k)
            ap *= 0.25;
          if(s.w)
            this.ay -= ap;
          if(s.a)
            this.ax -= ap;
          if(s.s)
            this.ay += ap;
          if(s.d)
            this.ax += ap;
          if(s.j)
            this.tmp.shoot(this);
          if(this.px < 0)
            this.px = 0;
          else if(this.px > 500)
            this.px = 500;
          if(this.py < 0)
            this.py = 0;
          else if(this.py > 600)
            this.py = 600;
          //wrp.log_pop();
        });
        break;
      case 2000: // enemy
        this.document_object.setAttribute('class', 'e_00');
        this.tmp.mode = 0;
        this.tmp.mode_time = 0;
        this.tmp.last_shoot_time = 0;
        this.tmp.mode_step = 0;
        this.tmp.shoot = function(t){
          var shoots_per_second = 4;
          if(t.time < this.last_shoot_time + 1 / shoots_per_second)
            return;
          this.last_shoot_time = t.time;
          switch(Math.floor(Math.random()*2)){
          case 0:
            for(var n = 64, m = 1 / 63; n; --n){
              var r = n * m * Math.PI * 2;
              var o = t.moonlight_barrages.pop_inactive_object();
              if(o){
                o.mutate(5000);
                o.tmp.master = t;
                o.px = t.px;
                o.py = t.py;
                o.vx = 0;
                o.vy = 0;
                o.ax = Math.sin(r) * 15;
                o.ay = Math.cos(r) * 15;
              }
            }
            break;
          case 1:
            for(var n = 8, m = 1 / 8; n; --n){
              var r = n * m * Math.PI * 0.9 + Math.PI * 0.5;
              var o = t.moonlight_barrages.pop_inactive_object();
              if(o){
                o.mutate(5001);
                o.tmp.master = t;
                o.px = t.px;
                o.py = t.py;
                o.vx = 0;
                o.vy = 0;
                o.ax = Math.sin(r) * 200;
                o.ay = Math.cos(r) * 200;
              }
            }
          }
        };
        this.tmp.move = function(t){
          switch(this.mode_step){
          case 0:
            // choose a target position
            this.move_to_x = Math.random() * 500;
            this.move_to_y = Math.random() * 600;
            this.mode_step = 1;
          case 1:
            // move
            var dx = this.move_to_x - t.px;
            var dy = this.move_to_y - t.py;
            if( Math.abs(dx) >= 1 && Math.abs(dy) >= 1 ){
              t.ax = dx * 0.1;
              t.ay = dy * 0.1;
            }else{
              this.mode = 3;
            }
          }
        };
        this.tmp.wait = function(t){
          switch(this.mode_step){
          case 0:
            // set a time
            this.wait_to = t.time + Math.random() * 1 + 1;
            this.mode_step = 1;
          case 1:
            // wait
            if(t.time > this.wait_to)
              this.mode = Math.floor(Math.random()*20) ? 3 : 0;
          }
        };
        this.initialize(250,50,0,0,0,0,0,function(){
          this.ax = -this.vx * 3;
          this.ay = -this.vy * 3;
          switch(this.tmp.mode){
          case 3:
            // single shoot
            this.tmp.shoot(this);
            this.tmp.mode = Math.floor(Math.random()*20) ? 3 : 0;
            break;
          case 2:
            // move
            this.tmp.move(this);
            break;
          case 1:
            // wait
            this.tmp.wait(this);
            break;
          default:
            // randomize
            this.tmp.mode = Math.floor(Math.random() * 4);
            this.tmp.mode_time = this.time;
            this.tmp.mode_step = 0;
            break;
          }
          if(this.px < 0)
            this.px = 0;
          else if(this.px > 500)
            this.px = 500;
          if(this.py < 0)
            this.py = 0;
          else if(this.py > 600)
            this.py = 600;
        });
        break;
      case 4000: // bullet
        this.document_object.setAttribute('class', 'b_00');
        this.initialize(null,null,null,null,null,null,0,function(){
          ;
        });
        break;
      case 5000:
        this.document_object.setAttribute('class', 'b_01');
        this.initialize(null,null,null,null,null,null,0,function(){
          if(this.time < 1)
            this.document_object.style.opacity = this.time;
        });
        break;
      case 5001:
        this.document_object.setAttribute('class', 'b_02');
        this.tmp.step = 0;
        this.initialize(null,null,null,null,null,null,0,function(){
          if(this.time < 1)
            this.document_object.style.opacity = this.time;
          this.rotate = 'rotate(' + Math.sin(this.time)*360 + 'deg)';
          switch(this.tmp.step){
          case 0:
            this.ax *= 0.97;
            this.ay *= 0.97;
            if(this.time >= 2)
              this.tmp.step = 1;
            break;
          case 1:
            var dx = this.moonlight_barrages.tmp.player.px - this.px;
            var dy = this.moonlight_barrages.tmp.player.py - this.py;
            var c = 100 / Math.sqrt(dx*dx+dy*dy);
            this.ax = dx * c * 1.75;
            this.ay = dy * c;
            if(this.time >= 6)
              this.tmp.step = 2;
            break;
          }
        });
        break;
      default:
        this.document_object.style.left = '10000px';
        this.document_object.style.top  = '10000px';
        this.document_object.setAttribute('class', 'disable');
        this.initialize(10000,10000,0,0,0,0,0,function(){});
        this.tmp = {};
        a = false;
        this.moonlight_barrages.push_inactive_object(this);
      }
      this.is_active = a;
      //wrp.log(this);
      //wrp.log_pop();
    },
    initialize: function(px,py,vx,vy,ax,ay,time,update_hook,document_object){
      //wrp.log_push('initialize', this);
      if(typeof px === typeof 0)
        this.px = px;
      if(typeof py === typeof 0)
        this.py = py;
      if(typeof vx === typeof 0)
        this.vx = vx;
      if(typeof vy === typeof 0)
        this.vy = vy;
      if(typeof ax === typeof 0)
        this.ax = ax;
      if(typeof ay === typeof 0)
        this.ay = ay;
      if(typeof time === typeof 0)
        this.time = time;
      if(typeof update_hook === typeof function(){})
        this.update_hook = update_hook;
      if(document_object)
        this.document_object = document_object;
      //wrp.log_pop();
    },
    update: function(dt){
      //wrp.log_push('update', this);
      this.time += dt;
      //if(this.update_hook)
        this.update_hook(dt);
      this.vx += this.ax * dt;
      this.vy += this.ay * dt;
      this.px += this.vx * dt;
      this.py += this.vy * dt;
      if(this.px < -100 || this.px > 600 || this.py < -100 || this.py > 700)
        this.mutate();
      //wrp.log_pop();
    },
    present: function(){
      //wrp.log_push('present', this);
      this.document_object.style.left = this.px + 'px';
      this.document_object.style.top  = this.py + 'px';
      if(this.moonlight_barrages.etc.enable_rotate){
        this.document_object.style.transform = this.rotate;
        this.document_object.style.mozTransform = this.rotate;
        this.document_object.style.webkitTransform = this.rotate;
      }
      //wrp.log_pop();
    },
  };

  var wrp_moonlight_barrages= function(){
    this.etc = {
      enable_rotate: false,
      max_objects: 32,
      dom: {
        container: 'moonlight_barrages',
      },
      frames_per_second:8,
    };
    this.tmp = {
      proc     : wrp.moonlight_barrages.proc.length,
      scene    : 0,
      dom      : {},
      time     : 0,
      player   : 3,
      bomb     : 3,
      barrage  : 0,
      score    : 0,
      max_score: 0,
      objects: [],
      inactive_object_keys: [],
      input_status: {
        w: false,
        a: false,
        s: false,
        d: false,
        j: false,
        k: false,
        p: false,
      },
    };
    wrp.moonlight_barrages.proc.push(this);
  };
  
  wrp_moonlight_barrages.prototype = {
    main: function(){
      wrp.log_push('main', this);
      if(this.tmp.scene < 1)
        this.initialize();
      if(this.tmp.scene >= 1)
        this.run();
      wrp.log_pop();  
    },
    run: function(){
      wrp.log_push('run', this);
      this.tmp.running = true;
      this.tmp.last_update = new Date();
      this.update();
      this.present();
      wrp.log_pop();
    },
    on_input: function(a, is_down){
      //wrp.log_push('on_input', this);
      var k = String.fromCharCode(a.which).toLowerCase();
      switch(k){
      // player move to up
      case 'w':
      case '&':
        this.tmp.input_status.w = is_down;
        break;
      // player move to left
      case 'a':
      case '%':
        this.tmp.input_status.a = is_down;
        break;
      // player move to down
      case 's':
      case '(':
        this.tmp.input_status.s = is_down;
        break;
      // player move to right
      case 'd':
      case "'":
        this.tmp.input_status.d = is_down;
        break;
      // player shoot
      case "j":
        this.tmp.input_status.j = is_down;
        break;
      // player slow
      case "k":
        this.tmp.input_status.k = is_down;
        break;
      // pause
      case "p":
        if (this.tmp.input_status.p == false && is_down){
          this.tmp.running = ! this.tmp.running;
          if(this.tmp.running){
            this.run();
            this.tmp.dom.music_00.volume = 1.00;
            this.tmp.dom.pause.style.opacity = 0;
          }else{
            this.tmp.dom.music_00.volume = 0.20;
            this.tmp.dom.pause.style.opacity = 1;
          }
        }
        this.tmp.input_status.p = is_down;
        break;
      }
      //wrp.log('w: ' + this.tmp.input_status.w);
      //wrp.log('a: ' + this.tmp.input_status.a);
      //wrp.log('s: ' + this.tmp.input_status.s);
      //wrp.log('d: ' + this.tmp.input_status.d);
      //wrp.log_pop();
    },
    update: function(){
      //wrp.log_push('update', this);
      var tc = new Date().getTime();
      var dt = (tc - this.tmp.last_update) * 0.001;
      this.tmp.time += dt;
      var os = this.tmp.objects;
      var as = 0;
      for(var k in os){
        if(os[k].is_active){
          ++as;
          os[k].update(dt);
        }
      }
      this.tmp.last_update = tc;
      if(this.tmp.running){
        var nt = this.tmp.ms_per_frame - (new Date().getTime() - tc);
        var t = this;
        //wrp.log('nt: ' + nt);
        setTimeout(function(){ t.update(); }, nt);
      }
      this.tmp.barrage = as;
      this.update_score(dt);
      //wrp.log_pop();
    },
    update_score: function(dt){
      this.tmp.score += this.tmp.barrage * Math.ceil(dt);
      if(this.tmp.score >= this.tmp.max_score)
        this.tmp.max_score = this.tmp.score;
    },
    present: function(){
      //wrp.log_push('present', this);
      var tc = new Date();
      var os = this.tmp.objects;
      for(var k in os){
        if(os[k].is_active)
          os[k].present();
      }
      if(this.tmp.running){
        var nt = this.tmp.ms_per_frame - (new Date().getTime() - tc);
        var t = this;
        //wrp.log('nt: ' + nt);
        setTimeout(function(){ t.present(); }, nt);
      }
      this.present_background();
      this.present_info();
      //wrp.log_pop();
    },
    present_background: function(){
      var a = Math.floor(this.tmp.time * 40);
      this.tmp.dom.stage.style.backgroundPositionY = a + 'px';
    },
    present_info: function(){
      this.tmp.dom.info_max_score.innerHTML = ('000000000' + this.tmp.max_score).slice(-9);
      this.tmp.dom.info_score.innerHTML     = ('000000000' + this.tmp.score    ).slice(-9);
      //this.tmp.dom.info_player.innerHTML = this.tmp.player;
      //this.tmp.dom.info_bomb.innerHTML = this.tmp.bomb;
      this.tmp.dom.info_time.innerHTML = (this.tmp.time).toFixed(3);
      this.tmp.dom.info_barrage.innerHTML = this.tmp.barrage;
    },
    pop_inactive_object: function(){
      //wrp.log_push('push_inactive_object', this);
      //wrp.log('length: ' + this.tmp.inactive_object_keys.length);
      //wrp.log('key   : ' + this.tmp.inactive_object_keys[0]);
      if(this.tmp.inactive_object_keys.length)
        return this.tmp.objects[this.tmp.inactive_object_keys.shift()];
      return null;
      //wrp.log_pop();
    },
    push_inactive_object: function(o){
      //wrp.log_push('push_inactive_object', this);
      //wrp.log('id: ' + o.id);
      this.tmp.inactive_object_keys.push(o.id);
      //wrp.log_pop();
    },
    initialize: function(){
      wrp.log_push('initialize', this);
      this.set_fps();
      this.initialize_dom();
      this.initialize_event();
      this.initialize_objects();
      this.initialize_scene();
      wrp.log_pop();
    },
    set_fps: function(){
      wrp.log_push('initialize', this);
      wrp.log('this.etc.frames_per_second: ' + this.etc.frames_per_second);
      this.tmp.ms_per_frame = 1000 / this.etc.frames_per_second;
      wrp.log('this.tmp.ms_per_frame     : ' + this.tmp.ms_per_frame);
      wrp.log_pop();
    },
    initialize_objects: function(){
      wrp.log_push('initialize_objects', this);
      this.tmp.objects = [];
      this.tmp.inactive_object_keys = [];
      for(var n = 0; n < this.etc.max_objects; ++n)
        var o = new staging_object(this);
      this.tmp.player = this.pop_inactive_object();
      if(this.tmp.player){
        this.tmp.player.mutate(1000);
      }
      this.tmp.enemy = this.pop_inactive_object();
      if(this.tmp.enemy){
        this.tmp.enemy.mutate(2000);
      }
      wrp.log_pop();
    },
    initialize_dom: function(){
      wrp.log_push('initialize_dom', this);
      var ed = this.etc.dom;
      var td = this.tmp.dom;
      td.container = document.getElementById(ed.container);
      td.stage     = document.getElementsByClassName('stage'   , td.container)[0];
      td.music_00  = document.getElementsByClassName('music_00', td.container)[0];
      td.pause     = document.getElementsByClassName('pause'   , td.container)[0];
      var ic = td.info_container = document.getElementsByClassName('info_container', td.container)[0];
      td.info_max_score = document.getElementsByClassName('max_score_value', ic)[0];
      td.info_score     = document.getElementsByClassName('score_value'    , ic)[0];
      td.info_player    = document.getElementsByClassName('player_value'   , ic)[0];
      td.info_bomb      = document.getElementsByClassName('bomb_value'     , ic)[0];
      td.info_time      = document.getElementsByClassName('time_value'     , ic)[0];
      td.info_barrage   = document.getElementsByClassName('barrage_value'  , ic)[0];
      wrp.log_pop();
    },
    initialize_event: function(){
      wrp.log_push('initialize_event', this);
      var c = this.tmp.dom.nacl_container;
      var t = this;
      document.addEventListener('keydown', function(a){ t.on_input(a, true ); }, false);
      document.addEventListener('keyup'  , function(a){ t.on_input(a, false); }, false);
      wrp.log_pop();
    },
    initialize_scene: function(){
      wrp.log_push('initialize_status', this);
      this.change_scene(1);
      wrp.log_pop();
    },
    change_scene: function(a){
      wrp.log_push('change_status', this);
      wrp.log(this.tmp.scene + ' --> ' + a);
      this.tmp.scene = a;
      wrp.log_pop();
    },
  };
  
  wrp_moonlight_barrages.proc = [];
  return wrp_moonlight_barrages;
})();

var main = function(){
  var configuration_from_fragment = function(){
    var a = location.hash;
    if(a.length === 0)
      return {};
    if(a[0] === '#')
      a = a.substring(1);
    var a = a.split(',');
    var r = {};
    for(var k in a){
      var b = a[k].split('=');
      r[b[0]] = b[1];
    }
    return r;
  };
  var g = new wrp.moonlight_barrages();
  var o = configuration_from_fragment();
  console.log(o);
  if(o.enable_rotate)
    g.etc.enable_rotate = Boolean(o.enable_rotate);
  if(o.frames_per_second)
    g.etc.frames_per_second = Number(o.frames_per_second);
  if(o.max_objects)
    g.etc.max_objects = Number(o.max_objects);
  g.main();
};

window.addEventListener('load', main, false);

