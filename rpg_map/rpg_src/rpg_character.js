//Character constructor function
//Creates a character object
function Character(world_object) {
  Entity.call(this, world_object);
  var world = world_object;
  var that = this;
  var current_animation_frame = "";
  this.isCharacter = true;
  this.z_index = 3;

  //Status of the menu
  var menu = 0;

  this.setDisplacement = function(x_displace_param, y_displace_param){
    that.x_px_displacement = x_displace_param;
    that.y_px_displacement = y_displace_param;
  }

  //Determines if a arrow key is currently pressed
  var toggle_key_up = false;
  var toggle_key_right = false;
  var toggle_key_down = false;
  var toggle_key_left = false;

  //Initializes the character and all its properties
  this.init = function(init_rpg_character_properties) {
    that.id = "main_character";
    processCharacterProperties(init_rpg_character_properties);
  }

  //Processes the character properties file
  //All properties defined in the in the init object are overwritten
  function processCharacterProperties(data) {
    that.properties = data;
    console.log(that.properties);
    //Defines initial variable values
    that = $.extend(that, that.properties["init"]);
    //Preloads character animation images outside of window
    let all_textures_listed=that.properties["texture"];
    let textures_keys = Object.keys(all_textures_listed);
    world.load_assertion();
  }

  //Draws the entity based on the current entity status.
  this.draw = function(scale) {
    let img_width = scale*that.size;
    //Preloads character animation images outside of window
    console.log(that.properties);
    let all_textures_listed = that.properties["texture"];
    let textures_keys = Object.keys(all_textures_listed);
    for(let i = 0; i<textures_keys.length;i++){
      let animation_frames = that.properties["texture"][textures_keys[i]];
      for(let j = 0;j<animation_frames.length;j++){
        let current_frame = animation_frames[j];
        let imageObject = new Image();
        imageObject.src = current_frame;
        imageObject.id = that.id+"_"+textures_keys[i]+"_"+j;
        imageObject.style = "display:none;";
        imageObject.className = "entity_element";
        document.getElementById("CharacterContent").appendChild(imageObject);
      }
    }
    current_animation_frame = that.defineAnimationFrame();
    document.getElementById(current_animation_frame).style = "width:" + img_width + "px;top:" +that.y_px_displacement + "px;left:" + that.x_px_displacement + "px;z-index:"+that.z_index;
  }

  //Updates the entity based on the current entity status.
  this.update = function(scale) {
    let img_width = scale*that.size;
    document.getElementById(current_animation_frame).style = "display:none;";
    current_animation_frame = that.defineAnimationFrame();
    document.getElementById(current_animation_frame).style = "width:" + img_width + "px;top:" +that.y_px_displacement + "px;left:" + that.x_px_displacement + "px;z-index:"+that.z_index;
  }

  //Computer controls
  //Handles Key down, depending on menu status can either move the character, interact with object, move within a menu, or select in a menu
  $("body").on("keydown", function(event) {
    checkKey(event);
  });

  $("body").on("keyup", function(event) {
    checkKeyUp(event);
  });

  //document.onkeydown = checkKey;
  function checkKey(e) {
    if (e.which == '90') {
      checkInteraction();
    } else if (e.which == '38') {
      if (menu == 1) {
        menuUp();
      } else {
        toggle_key_up = true;
      }
    } else if (e.which == '40') {
      if (menu == 1) {
        menuDown();
      } else {
        toggle_key_down = true;
      }
    } else if (e.which == '37') {
      if (menu == 1) {
        menuLeft();
      } else {
        toggle_key_left = true;
      }
    } else if (e.which == '39') {
      if (menu == 1) {
        menuRight();
      } else {
        toggle_key_right = true;
      }
    }
  }

  //document.onkeydown = checkKey;
  function checkKeyUp(e) {
    if (e.which == '90') {
      checkInteraction();
    } else if (e.which == '38') {
      if (menu != 1) {
        toggle_key_up = false;
      }
    } else if (e.which == '40') {
      if (menu != 1) {
        toggle_key_down = false;
      }
    } else if (e.which == '37') {
      if (menu != 1)
        toggle_key_left = false;
    } else if (e.which == '39') {
      if (menu != 1) {
        toggle_key_right = false;
      }
    }
  }

  //Based on pressed keys calculates the movement of the main character sets his direction and advances the time of animation
  this.moveBasedOnKeys = function() {
    let y_total = (-1 * toggle_key_up) + toggle_key_down;
    let x_total = (-1 * toggle_key_left) + toggle_key_right;
    if (y_total == -1 && x_total == 0) {
      that.setAnimation("up");
      that.advanceAnimationTime();
    } else if (y_total == 1 && x_total == 0) {
      that.setAnimation("down");
      that.advanceAnimationTime();
    } else if (y_total == 0 && x_total == 1) {
      that.setAnimation("right");
      that.advanceAnimationTime();
    } else if (y_total == 0 && x_total == -1) {
      that.setAnimation("left");
      that.advanceAnimationTime();
    } else if (y_total == 1 && x_total == 1) {
      that.setAnimation("down_right");
      that.advanceAnimationTime();
    } else if (y_total == -1 && x_total == -1) {
      that.setAnimation("up_left");
      that.advanceAnimationTime();
    } else if (y_total == -1 && x_total == 1) {
      that.setAnimation("up_right");
      that.advanceAnimationTime();
    } else if (y_total == 1 && x_total == -1) {
      that.setAnimation("down_left");
      that.advanceAnimationTime();
    } else {
      if(that.getAnimation()=="down_left"||that.getAnimation()=="up_left"||that.getAnimation()=="up_left"||that.getAnimation()=="down_right"||that.getAnimation()=="up"||that.getAnimation()=="right"||that.getAnimation()=="down"||that.getAnimation()=="left"){
        that.animation_time = 0;
      }
    }
    return[[that.x_pos, that.y_pos], [that.x_pos + (x_total * that.movement_unit), that.y_pos + (y_total * that.movement_unit)]];
  }


  //Predicts the apropriate movement based on the entity nature
  //Returns the origin and the destination of the character
  this.predictMovement = function(){
    return that.moveBasedOnKeys();
  }

  //Moves the entity based on its nature and the current collision directions.
  //If colliding in a direction, does not move.
  this.movePosition = function(){
    let from_to = that.moveBasedOnKeys();
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

  function resetCollision(){
    that.collisionUp = false;
    that.collisionDown = false;
    that.collisionLeft = false;
    that.collisionRight = false;
  }

  function activateVerticalCollision(){
    that.collisionUp = true;
    that.collisionDown = true;
  }
  function activateHorizontalCollision(){
    that.collisionLeft = true;
    that.collisionRight = true;
  }

  //Cancels all currently pressed arrow keys
  this.stopCharacter = function() {
    toggle_key_up = false;
    toggle_key_down = false;
    toggle_key_left = false;
    toggle_key_right = false;
  }
}
