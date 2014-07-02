// Dynamics Visualizer main class.

var DynamicsVisualizer = {};

DynamicsVisualizer = Class.create({
    /** 
      * DV is the main class for Dynamics Visualizer.
      * it contains methods to set up a default UI, and 
      * maps buttons' `onClick` to functions.
    **/ 

    init: function(){    
        /**
          * Checks whether the browser supports webGLs, and
          * initializes the DynamicVisualizer object.
        **/
        var self = this;
        console.log("[PyDy INFO]: initializing Visualizer");
        if(!self.isWebGLCompatible()){
            console.log("[PyDy ALERT]: Incompatible browser!");
            alert("The browser you are using is not compatible! " + 
                "Please use a latest version of Chrome or Firefox");
            return false;
        }
    },


    isWebGLCompatible: function(){ 
        /**
          * Checks whether the browser used is
          * compatible for handling webGL based
          * animations.
          * Requires external script: Modernizr.js
          *
        **/
        
        if (!Modernizr.canvas || !Modernizr.webgl) return false;
        else return true;
    },

    activateUIControls: function(){
        /**
          * This method adds functions to the UI buttons
          * It should be **strictly** called after the 
          * other DynamicsVisualizer sub-modules are loaded
          * in the browser, else certain functionality will 
          * be(not might be!) hindered.
        **/


        var self = this;
        jQuery("#simulation-load").click(function(){
            self.sceneFilePath = jQuery("#json-input").val();
            console.log("[PyDy INFO]: Loading scene JSON file:" + self.sceneFilePath);
            self.Parser.loadScene();
        });

        self._slider = jQuery("#time-slider").slider({min:0,max:100,step:1, handle:"square", value:0});
        self._slider.on('slide',function(ev) { 
            var val = ev.value;
            var len = self._timeArray.length;
            var i = 0;
            var gotValue = false;
            for( i=0;i<self._timeArray.length && !gotValue;i++){
                var percent = (self._timeArray[i]/self._timeArray[len-1])*100;
                if(val <= percent){ gotValue = true; break; }
            }
            self.Scene.setAnimationTime(self._timeArray[i]);
        });
            
            
        jQuery("#resetControls").click(function(){
            self.scene._resetControls();
        });

        jQuery("#play-animation").click(function(){
            self.Scene.runAnimation();
            
        });
        jQuery("#stop-animation").click(function(){
            self.Scene.stopAnimation();
            
        });
        jQuery("#close-object-dialog").click(function(){
            jQuery("#object-dialog").html(" ");
            jQuery(this).addClass("disabled");

        });

        jQuery("#show-model").click(function(){
            jQuery("#model-loader-wrapper").slideDown();
            jQuery(this).addClass("disabled");

        });

        jQuery("#close-model-dialog").click(function(){
            jQuery("#model-loader-wrapper").slideUp();
            jQuery("#show-model").removeClass("disabled")

        });

        console.log("[PyDy INFO]: Activated UI controls");


    },

    loadUIElements: function(){
        /**
          * This method loads UI elements
          * which can be loaded only **after**
          * scene JSON is loaded onto canvas.
        **/
        var self = this;
        
        jQuery("#play-animation").removeClass("disabled");
        jQuery("#show-model").removeClass("disabled");
        var objs = self.model.objects;
  
        jQuery("#object-dropdown").find("li").remove() // clean old dropdown list.
        
        for(var obj in objs){
            var toAppend = '<li><a id="'+ objs[obj].simulation_id + 
                           '" href="#">' + objs[obj].name + '</a></li>';
            jQuery("#object-dropdown").append(toAppend);
            // adding click functions to all dropdown objs.
            jQuery("#" + objs[obj].simulation_id).click(function(){
                self.ParamEditor.openDialog(jQuery(this).attr("id"));
            });
        }

        var constants = self.model.constant_map;
        var div = jQuery("#simulation-params").fadeOut();
        div.html(" "); // clear html first
        
        for(var i in constants){
            div.append('<span class="input-group-addon">' + i + '</span>');
            div.append(jQuery('<input />',{ type:'text', id: i, class: 'form-control', value: constants[i]}));
        }
        div.fadeIn();

        // enable CodeMirror...
        jQuery("#model-loader").html(" ");
        if(!self.editor){
            self.editor = CodeMirror.fromTextArea(document.getElementById('model-loader'), {
                height: "30em",
                mode: {name: "javascript", json: true},
                theme: "base16-light",
                textWrapping: true
            });
        }
        self.editor.getDoc().setValue(JSON.stringify(self.model,null,4));
    },   

    
    getBasePath: function(){
        /**
          * Returns the base path of
          * the loaded Scene file.
        **/ 
        var self = this;

        var slashes_fixed = self.sceneFilePath.replace(/\\/g, "/");
        return slashes_fixed.split("/").slice(0,-1).join("/") + "/";
    },

    getFileExtenstion: function(){
        /**
          * Returns the extension of
          * the loaded Scene file.
        **/ 
        var self = this;
        return self.sceneFilePath.split(".").slice(-1)[0].toLowerCase();

   }
});

var DynamicsVisualizer = new DynamicsVisualizer();
