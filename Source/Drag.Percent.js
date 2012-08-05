/*
---
description: Drag class that sets a percent value based on the size of the element relatiave to its container 

license: MIT-style

authors:
    - emehrkay <emehrkay@8trk.com>

requires:
    - Core/Element.Dimensions
    - /Drag

provides: [Drag.Percent]

...
*/
Drag.Percent = new Class({
    Extends: Drag,
    
    options: {
        'unit': '%',
        'auto_resize': true
    },
    
    initialize: function(element, container, options){
        this.container = document.id(container);
        this.parent(element, options);
        this.defineScale();
        
        if(this.options.auto_resize){
            this.windowResize();
        }
    },
    
    windowResize: function(){
        window.addEvent('resize', this.defineScale.bind(this));
        return this;
    },
    
    removeWindowResize: function(){
        window.remvoeEvent('resize', this.defineScale.bind(this));
        return this;
    },
    
    defineScale: function(){
        this.container_size = this.container.getSize();
        this.element_size = this.element.getSize();
        this.percent = {
            x: (this.element_size.x / this.container_size.x),
            y: (this.element_size.y / this.container_size.y) 
        };
        
        return this;
    },
    
    drag: function(event){
        var options = this.options;

		if (options.preventDefault) event.preventDefault();
		this.mouse.now = event.page;

		for (var z in options.modifiers){
			if (!options.modifiers[z]) continue;
			this.value.now[z] = (this.mouse.now[z] - this.mouse.pos[z]) * this.percent[z];

			if (options.invert) this.value.now[z] *= -1;

			if (options.limit && this.limit[z]){
				if ((this.limit[z][1] || this.limit[z][1] === 0) && (this.value.now[z] > this.limit[z][1])){
					this.value.now[z] = this.limit[z][1];
				} else if ((this.limit[z][0] || this.limit[z][0] === 0) && (this.value.now[z] < this.limit[z][0])){
					this.value.now[z] = this.limit[z][0];
				}
			}

			if (options.grid[z]) this.value.now[z] -= ((this.value.now[z] - (this.limit[z][0]||0)) % options.grid[z]);

			if (options.style) this.element.setStyle(options.modifiers[z], this.value.now[z] + options.unit);
			else this.element[options.modifiers[z]] = this.value.now[z];
		}

		this.fireEvent('drag', [this.element, event]);
    }
});

Element.implement({

	makePercentDraggable: function(parent, options){
	    parent = parent || this.getParent();
		var drag = new Drag.Percent(this, parent, options);
		this.store('dragger_percent', drag);
		return drag;
	}

});