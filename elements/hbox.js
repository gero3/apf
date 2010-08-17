/*
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 *
 */
// #ifdef __AMLHBOX || __AMLVBOX || __INC_ALL

/**
 * @define vbox Container that stacks it's children vertically.
 * @see element.hbox
 * @define hbox Container that stacks it's children horizontally.
 * Example:
 * <code>
 *  <a:hbox height="500" width="600">
 *      <a:vbox height="500" width="500">
 *          <a:bar height="250" caption="Top bar" />
 *          <a:hbox width="500" height="250">
 *              <a:bar width="150" caption="Bottom left bar"/>
 *              <a:bar width="350" caption="Bottom Right bar"/>
 *          </a:hbox>
 *      </a:vbox>
 *      <a:bar width="100" caption="Right bar"/>
 *  </a:hbox>
 * </code>
 * @addnode elements
 * @constructor
 *
 * @author      Ruben Daniels (ruben AT ajax DOT org)
 * @version     %I%, %G%
 * @since       0.9
 */
apf.hbox = function(struct, tagName){
    this.$init(tagName || "hbox", apf.NODE_VISIBLE, struct);
};
apf.vbox = function(struct, tagName){
    this.$init(tagName || "vbox", apf.NODE_VISIBLE, struct);
};

(function(){
    /**** Properties and Attributes ****/

    this.$focussable = false;
    this.$useLateDom = true; 
    this.$box        = true;
    this.$layout     = true;
    
    var input = {"INPUT":1, "SELECT":1, "TEXTAREA":1}

    /**
     * @attribute {String}  padding      the space between each element. Defaults to 2.
     * @attribute {Boolean} reverse      whether the sequence of the elements is in reverse order.
     * @attribute {String}  edge         the space between the container and the elements, space seperated in pixels for each side. Similar to css in the sequence top right bottom left. Defaults to "5 5 5 5".
     * Example:
     * <code>
     *  <a:vbox edge="10 10 40 10" />
     * </code>
     * @attribute {String} pack     
     *   Possible values:
     *   start
     *   center
     *   end
     * @attribute {Boolean} align
     *   Possible values:
     *   start
     *   center
     *   end
     *   stretch
     */
    this.$supportedProperties.push("padding", "reverse", "edge", "pack", "align");
    
    this.$propHandlers["padding"] = function(value){
        this.padding = parseInt(value);
        
        var node, nodes = this.childNodes, elms = [];
        for (var i = 0, l = nodes.length; i < l; i++) {
            if ((node = nodes[i]).nodeFunc == apf.NODE_VISIBLE && node.$amlLoaded)
                elms.push(node);
        }

        for (var i = 0, l = elms.length - 1; i < l; i++) {
            var b = (el = elms[i]).margin && apf.getBox(el.margin) || [0,0,0,0];
            b[this.$vbox ? 2 : 1] += this.padding;
            if (!apf.hasFlexibleBox && i != 0 && this.align == "stretch" && this.$vbox)
                b[0] += this.padding;
            el.$ext.style.margin = b.join("px ") + "px";
        }
        
        if (!apf.hasFlexibleBox)
            this.$resize();
    }
    
    this.$propHandlers["reverse"]  = function(value){
        if (apf.hasFlexibleBox)
            this.$int.style[apf.CSSPREFIX + "BoxDirection"] = value ? "reverse" : "normal";
        else {
            //@todo
        }
    };
    
    this.$propHandlers["edge"]  = function(value){
        var el = !apf.hasFlexibleBox && this.$vbox ? this.$ext : this.$int;
        el.style.padding = (this.$edge = apf.getBox(value)).join("px ") + "px";
        
        if (!apf.hasFlexibleBox)
            this.$resize();
    };
    
    this.$propHandlers["pack"]  = function(value){
        if (apf.hasFlexibleBox)
            this.$int.style[apf.CSSPREFIX + "BoxPack"] = value || "start";
        else if (this.$amlLoaded) {
            if (this.$vbox) {
                this.$int.style.verticalAlign = value == "center" ? "middle" : (value == "end" ? "bottom" : "top");
            }    
            else {
                this.$int.style.textAlign = "";
                
                var nodes = this.childNodes;
                for (var i = 0, l = nodes.length; i < l; i++) {
                    if ((node = nodes[i]).nodeFunc != apf.NODE_VISIBLE || !node.$amlLoaded) //|| node.visible === false 
                        continue;

                    node.$ext.style.textAlign = apf.getStyle(node.$ext, "textAlign") || "left";
                }
                
                this.$int.style.textAlign = value == "center" ? "center" : (value == "end" ? "right" : "left");
            }
        }
    };
    
    //@todo change overflow when height/width changes depending on $vbox
    
    this.$propHandlers["align"] = function(value){
        if (apf.hasFlexibleBox) {
            this.$int.style[apf.CSSPREFIX + "BoxAlign"] = value || "stretch";
            
            var stretch = !value || value == "stretch";
            var nodes = this.childNodes;
            var size  = this.$vbox ? "width" : "height";
            for (var i = 0, l = nodes.length; i < l; i++) {
                if (!(node = nodes[i]).$ext || node.$ext.nodeType != 1)
                    continue;

                //node.$ext.style.overflow = stretch && !this[size]? "visible" : "";
                node.$ext.style[size] = stretch ? "auto" : "";
            }
        }
        else if (this.$amlLoaded) {
            var stretch = !value || value == "stretch";
            
            if (!this.$vbox) {
                var nodes = this.childNodes;
                for (var i = 0, l = nodes.length; i < l; i++) {
                    if ((node = nodes[i]).nodeFunc != apf.NODE_VISIBLE || !node.$amlLoaded) //|| node.visible === false 
                        continue;
                    
                    node.$ext.style.verticalAlign = value == "center" ? "middle" : (value == "end" ? "bottom" : "top");
                }
            }
            else {
                var el = !apf.hasFlexibleBox && this.$vbox ? this.$ext : this.$int;
                el.style.textAlign = "";
                
                var nodes = this.childNodes;
                for (var i = 0, l = nodes.length; i < l; i++) {
                    if ((node = nodes[i]).nodeFunc != apf.NODE_VISIBLE || !node.$amlLoaded) //|| node.visible === false 
                        continue;

                    if (node.visible !== false) {
                        node.$ext.style.display   = value == "stretch" ? "block" : apf.INLINE;
                        node.$br.style.display    = value == "stretch" ? "none" : "";
                    }
                    node.$ext.style.textAlign = apf.getStyle(node.$ext, "textAlign") || "left";
                }
                
                el.style.textAlign = value == "center" ? "center" : (value == "end" ? "right" : "left");
            }
        }
    };
    
    function visibleHandler(e){
        if (apf.hasFlexibleBox) {
            if (this.$altExt)
                this.$altExt.style.display = e.value 
                    ? (apf.isGecko ? "-moz-stack" : apf.CSSPREFIX2 + "-box") 
                    : "none";
            return;
        }
        
        if (e.value) {
            this.$ext.style.display    = this.parentNode.$vbox 
                && this.parentNode.align == "stretch" ? "block" : apf.INLINE;
            if (this.$br)
                this.$br.style.display = this.parentNode.align == "stretch" ? "none" : "";
        }
        else {
            if (this.$br)
                this.$br.style.display = "none";
        }

        this.parentNode.$resize();
    }
    
    function resizeHandler(){
        if (!this.flex) {
            if (this.$lastSizeChild && 
              this.$lastSizeChild[0] == this.$ext.offsetWidth && 
              this.$lastSizeChild[1] == this.$ext.offsetHeight)
                return;
            
            /*if (this.$skipResizeOnce)
                delete this.$skipResizeOnce;
            else*/
                this.parentNode.$resize(true);
            
            this.$lastSizeChild = [this.$ext.offsetWidth, this.$ext.offsetHeight];
        }
    }
    
    var handlers = {
        //Handlers for flexible box layout
        "true" : {
            "width" : function(value){
                if (this.parentNode.$vbox && this.parentNode.align == "stretch")
                    return;
                
                (this.$altExt || this.$ext).style.width = value 
                    ? (parseInt(value) == value 
                        ? value + "px"
                        : value)
                    : "";
            },
            
            "height" : function(value){
                if (!this.parentNode.$vbox && this.parentNode.align == "stretch")
                    return;

                (this.$altExt || this.$ext).style.height = value 
                    ? (parseInt(value) == value 
                        ? value + "px"
                        : value)
                    : "";
            },
            
            "margin" : function(value){
                var b = apf.getBox(value);
                if (this.parentNode.lastChild != this)
                    b[this.parentNode.$vbox ? 2 : 1] += this.parentNode.padding;
                this.$ext.style.margin = b.join("px ") + "px";
            },
            
            "flex" : function(value){
                this.flex = value = parseInt(value);
                if (value) {
                    if (!this.$altExt) {
                        var doc = this.$ext.ownerDocument;
                        var sp = (this.$altExt = doc.createElement("div")).appendChild(doc.createElement("span"));
                        this.parentNode.$int.replaceChild(this.$altExt, this.$ext);
                        sp.appendChild(this.$ext);
                        
                        this.$altExt.style.display = apf.CSSPREFIX2 + "-box";
                        sp.style.display  = apf.isGecko ? "-moz-stack" : apf.CSSPREFIX2 + "-box";
                        sp.style.position = "relative";
                        if (!this.parentNode.$vbox)
                            sp.style["width"] = "43px";
                        else if (!apf.isWebkit) //stupid webkit isnt 90 degrees symmetrical
                            sp.style["height"] = "0px";
                        sp.style[this.parentNode.$vbox ? "minHeight" : "minWidth"] = "100%";
                        sp.style[apf.CSSPREFIX + "BoxOrient"] = "horizontal";
                        sp.style[apf.CSSPREFIX + "BoxFlex"]   = 1;
                        
                        this.$ext.style[apf.CSSPREFIX + "BoxFlex"] = 1;
                    }
                    this.$altExt.style[apf.CSSPREFIX + "BoxFlex"] = parseInt(value) || 1;
                }
                else if (this.$altExt) {
                    this.parentNode.$int.replaceChild(this.$ext, this.$altExt);
                    this.$ext.style[apf.CSSPREFIX + "BoxFlex"] = "";
                    delete this.$altExt;
                }
            }
        },
        
        //Handlers for older browsers
        "false" : {
            "width" : function(value){
                if (this.parentNode.$vbox && this.parentNode.align == "stretch")
                    return;
              
                this.$ext.style.width = value
                    ? (parseInt(value) == value 
                        ? Math.max(0, value - apf.getWidthDiff(this.$ext)) + "px"
                        : value)
                    : "";
            },
            
            "height" : function(value){
                if (this.parentNode.localName == "hbox" && this.parentNode.align == "stretch")
                    return;
      
                this.$ext.style.height = value 
                    ? (parseInt(value) == value 
                        ? Math.max(0, value - apf.getHeightDiff(this.$ext)) + "px"
                        : value)
                    : "";
            },
            
            "margin" : function(value){
                var b = apf.getBox(value);
                if (this.padding) {
                    if (this.parentNode.lastChild != this)
                        b[this.parentNode.$vbox ? 2 : 1] += this.padding;
                    if (this != this.parentNode.firstChild && this.parentNode.align == "stretch" && this.parentNode.$vbox) //@todo
                        b[0] += this.padding;
                }
                this.$ext.style.margin = b.join("px ") + "px";
            },
            
            "flex" : function(value){
                this.flex = parseInt(value);
                if (this.$amlLoaded)
                    this.parentNode.$resize();
            }
        }
    }
    
    //@todo move this to enableTable, disableTable
    this.register = function(amlNode){
        if (amlNode.$altExt) //@todo hack, need to re-arch layouting
            return;

        amlNode.$propHandlers["left"]   = 
        amlNode.$propHandlers["top"]    = 
        amlNode.$propHandlers["right"]  = 
        amlNode.$propHandlers["bottom"] = apf.K;

        var propHandlers = handlers[apf.hasFlexibleBox];
        for (var prop in propHandlers) {
            amlNode.$propHandlers[prop] = propHandlers[prop];
        }

        if (amlNode.nodeFunc == apf.NODE_VISIBLE) {
            if (apf.hasFlexibleBox) {
                //if (apf.isGecko && apf.getStyle(amlNode.$ext, "display") == "block")
                    //amlNode.$ext.style.display = "-moz-stack"; //@todo visible toggle
                
                //input elements are not handled correctly by firefox and webkit
                if (input[amlNode.$ext.tagName]) {
                    var doc = amlNode.$ext.ownerDocument;
                    amlNode.$altExt = doc.createElement("div");
                    amlNode.parentNode.$int.replaceChild(amlNode.$altExt, amlNode.$ext);
                    amlNode.$altExt.style[apf.CSSPREFIX + "BoxSizing"] = "border-box";
                    amlNode.$altExt.appendChild(amlNode.$ext);
                    
                    if (apf.isWebkit) {
                        var d = apf.getDiff(amlNode.$ext);
                        //amlNode.$altExt.style.padding = "0 " + d[0] + "px " + d[1] + "px 0";
                        amlNode.$altExt.style.height = "100%";
                        amlNode.$altExt.style.lineHeight = 0;
                        amlNode.$ext.style.width  = "100%";
                        amlNode.$ext.style.height  = "100%";
                    }
                    else {
                        amlNode.$altExt.style.display = apf.CSSPREFIX2 + "-box";
                        amlNode.$altExt.style[apf.CSSPREFIX + "BoxOrient"] = "horizontal";
                        amlNode.$altExt.style[apf.CSSPREFIX + "BoxAlign"]  = "stretch";
                        amlNode.$ext.style[apf.CSSPREFIX + "BoxFlex"] = 1;
                    }
                }
                else {
                    if (apf.getStyle(amlNode.$ext, "display") == "inline")
                        amlNode.$ext.style.display = "block"; //@todo undo
                    if (apf.getStyle(amlNode.$ext, "position") == "absolute")
                        amlNode.$ext.style.position = "relative"; //@todo undo
                }
                
                amlNode.$ext.style[apf.CSSPREFIX + "BoxSizing"] = "border-box";
            }
            else {
                if (this.$vbox) {
                    amlNode.$br = this.$int.insertBefore(amlNode.$ext.ownerDocument.createElement("br"), amlNode.$ext.nextSibling);
                    //amlNode.$br.style.lineHeight = "0";
                    this.$int.style.fontSize = "";
                    amlNode.$ext.style.fontSize = apf.getStyle(amlNode.$ext, "fontSize") || "normal";
                    this.$int.style.fontSize = "0";
                }
                else {
                    if (amlNode.visible !== false)
                        amlNode.$ext.style.display = apf.INLINE;
                    this.$int.style.whiteSpace = "";
                    amlNode.$ext.style.whiteSpace = apf.getStyle(amlNode.$ext, "whiteSpace") || "normal";
                    this.$int.style.whiteSpace = "nowrap";
                }
                
                amlNode.addEventListener("resize", resizeHandler);
            }
            
            amlNode.addEventListener("prop.visible", visibleHandler);
    
            this.$noResize = true;
            
            if (amlNode.height)
                propHandlers.height.call(amlNode, amlNode.height);
            if (amlNode.width)
                propHandlers.width.call(amlNode, amlNode.width);
            if (amlNode.margin)
                propHandlers.margin.call(amlNode, amlNode.margin);
            if (amlNode.flex)
                propHandlers.flex.call(amlNode, amlNode.flex);    
            
            if (this.lastChild == amlNode) {
                this.$propHandlers["padding"].call(this, this.padding);
                this.$propHandlers["align"].call(this, this.align);
                
                if (!apf.hasFlexibleBox)
                    this.$propHandlers["pack"].call(this, this.pack);
            }
        
            delete this.$noResize;
            
            if (!apf.hasFlexibleBox && this.lastChild == amlNode)
                this.$resize();
        }
    }
    
    this.unregister = function(amlNode){
        amlNode.$propHandlers["left"]   = 
        amlNode.$propHandlers["top"]    = 
        amlNode.$propHandlers["right"]  = 
        amlNode.$propHandlers["bottom"] = null;
        
        var propHandlers = handlers[apf.hasFlexibleBox];
        for (var prop in propHandlers) {
            delete amlNode.$propHandlers[prop];
        }
        
        //Clear css properties and set layout
        if (amlNode.nodeFunc == apf.NODE_VISIBLE) {
            if (amlNode.flex)
                propHandlers.flex.call(amlNode, 0);
            
            if (apf.hasFlexibleBox) {
                amlNode.$ext.style[apf.CSSPREFIX + "BoxSizing"] = "";
                
                if (apf.isGecko && amlNode.$ext.style.display == "block")
                    amlNode.$ext.style.display = "";
            }
            else {
                amlNode.$ext.style.verticalAlign = "";
                amlNode.$ext.style.textAlign = "";
                amlNode.$ext.style.whiteSpace = "";
                //amlNode.$ext.style[apf.CSSFLOAT] = "";
                
                if (amlNode.$br) {
                    amlNode.$br.parentNode.removeChild(amlNode.$br);
                    delete amlNode.$br;
                    amlNode.$ext.style.fontSize = "";
                }
                
                amlNode.removeEventListener("resize", resizeHandler);
            }
            
            amlNode.removeEventListener("prop.visible", visibleHandler);
            
            amlNode.$ext.style.display = amlNode.visible ? "block" : "none";
            
            if (amlNode.margin)
                amlNode.$ext.style.margin = "";
            
            if (amlNode.width)
                amlNode.$ext.style.width = "";
        }
    }
    /*
         this.addEventListener("DOMNodeInsertedIntoDocument", function(e){
        this.register(this.parentNode);
    });
    */
    
    /**** DOM Hooks ****/
    
    this.addEventListener("DOMNodeRemoved", function(e){
        if (e.$doOnlyAdmin || e.currentTarget == this)
            return;

        if (e.relatedNode == this){
            this.unregister(e.currentTarget);
            //e.currentTarget.$setLayout();
        }
    });

    /*this.addEventListener("DOMNodeInserted", function(e){
        if (e.currentTarget == this || e.currentTarget.nodeType != 1)
            return;

        if (e.relatedNode == this) {
            if (e.$isMoveWithinParent) {
                visibleHandler.call(e.currentTarget, {sync: true}); 
            }
            else {
                e.currentTarget.$setLayout("table");
                if (e.currentTarget.nextSibling)
                    visibleHandler.call(e.currentTarget, {sync: true});
            }
        }
    });*/
    
    function myVisibleHandler(e){
        if (e.value)
            this.$int.style.display = apf.CSSPREFIX2 + "-box";
    }
    
    function myHeightHandler(e){
        if (e.value || this.align != "stretch") {
            clearInterval(this.$heighttimer);
            delete this.$heighttimer;
        }
        else if (!this.$heighttimer) {
            var _self = this;
            this.$heighttimer = $setInterval(function(){
                var nodes = _self.childNodes;
                for (var $int, i = 0, l = nodes.length; i < l; i++) {
                    if (!($int = (node = nodes[i]).$int || node.$container))
                        continue;

                    if ($int.scrollHeight > $int.offsetHeight)
                        return _self.$resize(true);
                }
            }, 500);
        }
    }
    
    this.$draw = function(){
        var doc = this.$pHtmlNode.ownerDocument;
        this.$ext = this.$pHtmlNode.appendChild(doc.createElement("div"));
        this.$ext.className = this.localName;

        this.$vbox = this.localName == "vbox";
        this.$int = apf.isGecko && !this.parentNode.$box || !apf.hasFlexibleBox && this.$vbox //@todo reparenting for gecko needs some admin work
            ? this.$ext.appendChild(doc.createElement("div")) 
            : this.$ext;
        this.$ext.host = this;
        
        if (apf.isGecko && !this.parentNode.$box) {
            this.$int.style.width = "100%";
            this.$int.style.height = "100%";
        }
        else if (!apf.hasFlexibleBox && this.$vbox) {
            this.$int.style.display = apf.INLINE;
            this.$int.style.width   = "100%";
        }
        
        if (apf.hasFlexibleBox) {
            this.$int.style.display = apf.CSSPREFIX2 + "-box";
            this.$int.style[apf.CSSPREFIX + "BoxOrient"] = this.localName == "hbox" ? "horizontal" : "vertical";
            if (apf.isGecko) //!webkit
                this.$int.style[apf.CSSPREFIX + "BoxSizing"] = "border-box";
            this.$int.style[apf.CSSPREFIX + "BoxAlign"]  = "stretch";
            
            this.addEventListener("prop.visible", myVisibleHandler);
        }
        else {
            if (!this.$vbox) {
                this.$int.style.whiteSpace = "nowrap";
                this.addEventListener("prop.height", myHeightHandler);
            }

            var spacer = (!apf.hasFlexibleBox && this.$vbox ? this.$ext : this.$int)
                            .appendChild(doc.createElement("strong"));
            spacer.style.height        = "100%";
            spacer.style.display       = apf.INLINE;
            //spacer.style.marginLeft    = "-4px";
            spacer.style.verticalAlign = "middle";
            
            this.addEventListener("resize", this.$resize);
        }

        if (this.getAttribute("class")) 
            apf.setStyleClass(this.$ext, this.getAttribute("class"));
        
        this.$originalMin = [this.minwidth || 0,  this.minheight || 0];
    };
    
    this.$isWaitingOnDisplay = false;
    this.$waitForVisibility = function(){
        if (this.$isWaitingOnDisplay)
            return;
        
        var _self = this;
        this.$listenToDisplay = function (e){
            if (apf.isTrue(e.value) 
              && (_self.$ext.offsetWidth || _self.$ext.offsetHeight)) {
                _self.$resize();
                
                //Cleanup
                var p = _self;
                while (p) {
                    p.removeEventListener("prop.visible", _self.listenToDisplay);
                    p = p.parentNode;
                }
                
                _self.$isWaitingOnDisplay = false;
            }
        }
        
        var p = this;
        while(p) {
            p.addEventListener("prop.visible", this.$listenToDisplay);
            p = p.parentNode;
        }
        
        this.$isWaitingOnDisplay = true;
    }
    
    this.$resize = function(force){
        if (!this.$amlLoaded || this.$noResize) //force !== true && 
            return;

        //Protection for stretch re-resizing
        if (force !== true && this.$lastSize && 
          this.$lastSize[0] == this.$int.offsetWidth && 
          this.$lastSize[1] == this.$int.offsetHeight)
            return;
        
        if (!this.$ext.offsetHeight && !this.$ext.offsetWidth)
            return this.$waitForVisibility();
        
        this.$lastSize = [this.$int.offsetWidth, this.$int.offsetHeight];
        
        //this.$ext.style.border = "1px solid " + (["red", "green", "blue"])[Math.round(Math.random() * 2)];
        
        /*if (this.$table.offsetWidth >= this.$ext.offsetWidth)
            this.$ext.style.minWidth = (this.minwidth = Math.max(0, this.$table.offsetWidth 
                - apf.getWidthDiff(this.$ext))) + "px";
        else {
            this.$ext.style.minWidth = "";
            this.minwidth = this.$originalMin[0];
        }

        if (this.$table.offsetHeight >= this.$ext.offsetHeight)
            this.$ext.style.minHeight = (this.minheight = Math.max(0, this.$table.offsetHeight 
                - apf.getHeightDiff(this.$ext))) + "px";
        else {
            this.$ext.style.minHeight = "";
            this.minheight = this.$originalMin[1];
        }*/
        
        //if (!this.$vbox) alert("here");
        
        var total    = 0;
        var size     = this.$vbox ? "width" : "height";
        var minsize  = this.$vbox ? "min-width" : "min-height";
        var osize    = this.$vbox ? "height" : "width";
        var offset   = this.$vbox ? "offsetWidth" : "offsetHeight";
        var ooffset  = this.$vbox ? "offsetHeight" : "offsetWidth";
        var getDiff  = this.$vbox ? "getWidthDiff" : "getHeightDiff";
        var ogetDiff = this.$vbox ? "getHeightDiff" : "getWidthDiff";
        var inner    = this.$vbox ? "getHtmlInnerWidth" : "getHtmlInnerHeight";
        var oinner   = this.$vbox ? "getHtmlInnerHeight" : "getHtmlInnerWidth";

        var nodes = this.childNodes, hNodes = [], fW = 0;
        for (var node, i = 0; i < nodes.length; i++) {
            if ((node = nodes[i]).nodeFunc != apf.NODE_VISIBLE || node.visible === false || !node.$amlLoaded)
                continue;

            hNodes.push(node);
            if (!node[size]) {
                //if (!node.$skipResizeOnce) node.$skipResizeOnce = 1;
                //else node.$skipResizeOnce++;
                //node.$skipResizeOnce = 1
                node.$ext.style[size] = ""; //@todo this is a sucky way of measuring
            }

            if (parseInt(node.flex))
                total += parseFloat(node.flex);
            else {
                var m = node.margin && apf.getBox(node.margin);
                if (m && !this.$vbox) m.shift();
                fW += node.$ext[ooffset] + (m ? m[0] + m[2] : 0); //this.padding + 
            }
        }
        
        //Stretching - for IE8 this could be done using box-sizing and height:100%
        if (this.align == "stretch") {
            var pH = this.$int[offset] - apf[getDiff](this.$int);// - (2 * this.padding);
            for (var i = 0, l = hNodes.length; i < l; i++) {
                node = hNodes[i];
                
                if (!node[size] && !this.$vbox || this.$vbox && input[node.$ext.tagName]) {
                    var m = node.margin && apf.getBox(node.margin);
                    if (m && this.$vbox) m.unshift();
                    node.$ext.style[size] = 
                        Math.max(0, pH - apf[getDiff](node.$ext) - (m ? m[0] + m[2] : 0)) + "px";
                }
            }
        }

        //Flexing
        if (total > 0) {
            if (this.$vbox)
                this.$int.style.height = "100%";
            this.$int.style.overflow = "hidden";
            
            var rW = this.$int[ooffset] - apf[ogetDiff](this.$int) - fW 
              - ((hNodes.length - 1) * this.padding);// - (2 * this.edge);
            var lW = rW, done = 0;
            for (var i = 0, l = hNodes.length; i < l; i++) {
                if ((node = hNodes[i]).flex) {
                    var v = (i % 2 == 0 ? Math.floor : Math.ceil)((rW / total) * parseInt(node.flex));
                    done += parseInt(node.flex);
                    var m = node.margin && apf.getBox(node.margin);
                    if (m && !this.$vbox) m.shift();
                    node.$ext.style[osize] = Math.max(0, (done == total ? lW : v) - apf[ogetDiff](node.$ext) - (m ? m[0] + m[2] : 0)) + "px";
                    lW -= v;
                }
            }
        }
        else {
            if (this.$vbox)
                this.$int.style.height = "";
            this.$int.style.overflow = "";
        }
        
        /*this.$noResize = true;
        var _self = this;
        setTimeout(function(){
            _self.$noResize = false;
        });*/
    }
    
    this.$loadAml = function(x){
        if (this.padding == undefined)
            this.padding = 0;
            //this.$propHandlers.padding.call(this, this.padding = 0);
        if (this.edge == undefined)
            this.$propHandlers.edge.call(this, this.edge = 0);
        if (this.pack == undefined)
            this.$propHandlers.pack.call(this, this.edge = "start");
        if (this.align == undefined)
            this.align = "stretch";
            //this.$propHandlers.align.call(this, this.align = "stretch");
        if (!apf.hasFlexibleBox && !this.$vbox && !this.height && this.align == "stretch")
            myHeightHandler.call(this, {});
    };
}).call(apf.vbox.prototype = new apf.GuiElement());

apf.hbox.prototype = apf.vbox.prototype;

apf.aml.setElement("hbox", apf.hbox);
apf.aml.setElement("vbox", apf.vbox);
// #endif
