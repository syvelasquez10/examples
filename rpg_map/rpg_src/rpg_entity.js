//Entity constructor function
//Creates a entity entity
function Entity(world_object) {
  var world = world_object;
  var that = this;
  this.nature = undefined;
  this.isCharacter = false;
  this.properties = {};
  //Texture name of entity when he is facing left, down, right, up
  //Can be changed to other values for other expressions or actions manually, updates on draw() call
  this.texture = "down";

  //The identifier for this entity, used as the object html id
  this.id = undefined;

  //measured left to right the starting location of the main entity on the x axis on current map
  this.x_pos = 1;
  //measured top to bottom the starting location of the main entity on the y axis on current map
  this.y_pos = 1;

  //Defines how long an animation cycle takes in miliseconds, should be a multiple of world speed
  //Animation frames are displayed equal times within cycle.
  this.animation_cycle = 1980;
  //Defines the current animation time, resets to zero when greater thn animation cycle
  this.animation_time = 0;

  //Determines where on screen the main entity is painted based on the screen size and the world scale.
  this.x_px_displacement; //= (width / 2) - (scale / 2);
  this.y_px_displacement; //= (hight / 2) - (scale / 2);

  //Determines the range of the hitbox of the entity relative to its position, a is a number between 0 and 1.
  this.x_hitbox_start = 0;
  this.y_hitbox_start = 0;
  this.x_hitbox_end = 1;
  this.y_hitbox_end = 1;

  //Returns the coordinates of this entities hitbox
  this.getHitbox = function(){
    return [this.x_pos+that.x_hitbox_start, this.y_pos+that.y_hitbox_start, this.x_pos+that.x_hitbox_end, this.y_pos+that.y_hitbox_end];
  }

  this.setDisplacement = function(x_displace_param, y_displace_param){
    that.x_px_displacement = x_displace_param;
    that.y_px_displacement = y_displace_param;
  }

  this.getPos = function(){
    return [that.x_pos,that.y_pos];
  }

  //Determines how far the entity moves should be 1 divided by a multiple of 2
  //1, 0.5, 0.25, 0.125, etc
  this.movement_unit = 0.125;

  //Initializes the entity and all its properties
  this.init = function(entity_properties) {
    processEntityProperties(entity_properties);
  }

  //Processes the entity properties file
  //All properties defined in the in the init object are overwritten
  function processEntityProperties(data) {
    console.log(data);
    that.properties = data;
    //Defines initial variable values
    that = $.extend(that, that.properties["init"]);
    //Preloads character animation images outside of window
    let all_textures_listed = that.properties["texture"];
    let textures_keys = Object.keys(all_textures_listed);
    for(let i = 0; i<textures_keys.length;i++){
      let animation_frames = that.properties["texture"][textures_keys[i]];
      for(let j = 0;j<animation_frames.length;j++){
        let current_frame = animation_frames[j];
        Image2 = new Image(150,150);
        Image2.src = current_frame;
      }
    }
  }

  //Draws the entity based on the current entity status.
  this.draw = function(scale) {
    let entityTexturePath = that.defineAnimationFrame();
    let entity_layer_inyection = "<img id='"+that.id+"' class='entity_element' style='width:" + scale + "px;top:" +
      that.y_px_displacement + "px;left:" + that.x_px_displacement + "px' src='" + entityTexturePath + "'>";
    document.getElementById("EntityContent").innerHTML = document.getElementById("EntityContent").innerHTML+entity_layer_inyection;
  }

  //Updates the entity based on the current entity status.
  this.update = function(scale) {
    let entityTexturePath = that.defineAnimationFrame();
    let main_entity_element = $("#"+that.id);
    main_entity_element.css({
      "width":scale+"px",
      "top":that.y_px_displacement+"px",
      "left":that.x_px_displacement+"px"
    });
    main_entity_element.attr("src", entityTexturePath);
  }

  this.advanceAnimationTime = function(){
    that.animation_time = that.animation_time + world.time_per_frame;
  }

  //Based on the current time, the amount of frames in a animation, the total duration of a animation
  //Returns the Current frame that should be painted
  this.defineAnimationFrame = function(){
    let current_animation_group = that.properties["texture"][that.texture];
    let time_per_animation_frame = (that.animation_cycle/current_animation_group.length);
    if(that.animation_time>that.animation_cycle){
      that.animation_time = 0;
      return current_animation_group[0];
    }
    for(var i = 0; i<current_animation_group.length;i++){
      if(that.animation_time>=(i*time_per_animation_frame)&&that.animation_time<=((i+1)*time_per_animation_frame)){

        return current_animation_group[i];
      }
    }
    return "error";
  }

  //Determines if this entity is colliding in a certain direction. if true, cant move in said direction
  this.collisionUp = false;
  this.collisionDown = false;
  this.collisionLeft = false;
  this.collisionRight = false;

  this.setCollisionDown = function(){
    that.collisionDown = true;
  }

  //Predicts the apropriate movement based on the entity nature
  //Returns the origin and the destination of the entity
  this.predictMovement = function(){
    return that.nature.movement(world,this);
  }

  //Moves the entity based on its nature and the current collision directions.
  //If colliding in a direction, does not move.
  this.movePosition = function(){
    that.advanceAnimationTime();
    let from_to = that.nature.movement(world,this);
    let destination = from_to[1];
    if(from_to[0][0]<from_to[1][0]&&!that.collisionRight){
      that.x_pos = destination[0];
    }
    if(from_to[0][0]>from_to[1][0]&&!that.collisionLeft){
      that.x_pos = destination[0];
    }
    if(from_to[0][1]<from_to[1][1]&&!that.collisionDown){
      that.y_pos = destination[1];
    }
    if(from_to[0][1]>from_to[1][1]&&!that.collisionUp){
      that.y_pos = destination[1];
    }
    resetCollision();
  }

  this.setPosition = function(x_pos_param,y_pos_param){
    that.x_pos = x_pos_param;
    that.y_pos = y_pos_param;
  }

  function resetCollision(){
    that.collisionUp = false;
    that.collisionDown = false;
    that.collisionLeft = false;
    that.collisionRight = false;
  }

  function activateCollision(){
    that.collisionUp = true;
    that.collisionDown = true;
    that.collisionLeft = true;
    that.collisionRight = true;
  }

}
