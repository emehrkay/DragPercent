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
        
        this.addEvent('onBeforeStart', function(){
            this.element_position = this.element.getPosition(this.container);
        }, this);

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
        this.element_position = this.element.getPosition(this.container);
        this.percent = {
            x: (this.element_size.x / this.container_size.x),
            y: (this.element_size.y / this.container_size.y) 
        };

        return this;
    },
    
    start: function(event){
		var options = this.options;

		if (event.rightClick) return;

		if (options.preventDefault) event.preventDefault();
		if (options.stopPropagation) event.stopPropagation();
		this.mouse.start = event.page;

		this.fireEvent('beforeStart', this.element);

		var limit = options.limit;
		this.limit = {x: [], y: []};

		var z, coordinates;
		for (z in options.modifiers){
			if (!options.modifiers[z]) continue;

			var style = this.element.getStyle(options.modifiers[z]);

			// Some browsers (IE and Opera) don't always return pixels.
			if (style && !style.match(/px$/)){
				if (!coordinates) coordinates = this.element.getCoordinates(this.element.getOffsetParent());
				style = coordinates[options.modifiers[z]];
			}

			if (options.style) this.value.now[z] = (style || 0).toInt();
			else this.value.now[z] = this.element[options.modifiers[z]];

			if (options.invert) this.value.now[z] *= -1;

			this.mouse.pos[z] = event.page[z];

			if (limit && limit[z]){
				var i = 2;
				while (i--){
					var limitZI = limit[z][i];
					if (limitZI || limitZI === 0) this.limit[z][i] = (typeof limitZI == 'function') ? limitZI() : limitZI;
				}
			}
		}

		if (typeOf(this.options.grid) == 'number') this.options.grid = {
			x: this.options.grid,
			y: this.options.grid
		};

		var events = {
			mousemove: this.bound.check,
			mouseup: this.bound.cancel
		};
		events[this.selection] = this.bound.eventStop;
		this.document.addEvents(events);
	},
    
    drag: function(event){
        var options = this.options;

		if (options.preventDefault) event.preventDefault();
		this.mouse.now = event.page;

		for (var z in options.modifiers){
			if (!options.modifiers[z]) continue;
			
            var delta_value = (this.mouse.now[z] - this.mouse.pos[z] + this.element_position[z]) * this.percent[z];
            this.value.now[z] = (delta_value / this.element_size[z]) * 100;

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
    },
    
    stop: function(event){
        this.element_position = this.element.getPosition(this.container);
        this.parent(event);
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