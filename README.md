Drag.Percent
===========

This class allows for elements to be dragged using percent-based units. The units are calculated based on the element/container ratio.

How to use
----------

Usage is the same as Drag except with an additional argument in the constructor defining the element's container. 

Options:

* auto_resize -- Flag stating that the window resize event should trigger the Drag.Percent.defineScale method. Defaults to true

Events:
* See Mootools.more.Drag

    var element = document.id('element'),  
        container = document.id('container'),  
        options = {'auto_resize': false},  
        drag = new Drag.Percent(element, container, options); 

If your element or container will resize, simply call the defineScale method after the resizing.

    element.setStyle('width', '50%');
    drag.defineScale();