/* jshint esversion: 6 */
/*
 * Author: Matto
 */
(function($) {

  $.fn.octopus = function(userOptions) {

    const defaultOptions = {
      sectionSelector: 'section',
      dataAttribute: 'octopus'
    };

    const options = $.extend(defaultOptions, userOptions);

    const original = this;

    let sections = [];
    let variations = [];

    $(options.sectionSelector + '[data-' + options.dataAttribute + ']').each(function() {

      const $this = $(this);
      const variation = $this.data(options.dataAttribute);

      if(variations.indexOf(variation) < 0) {
        variations.push(variation);
      }

      if(variation) {
        sections.push($this);
      }

    });

    if(variations.length == 0) {
      return this;
    }

    let octopus = $('<div class="octopus"></div>');

    const positioningCSS = original.wrap('<div style="display: none"></div>').css(['position', 'top', 'left', 'right', 'bottom', 'z-index', 'margin', 'width']);
    positioningCSS.overflow = 'hidden';

    octopus.css(positioningCSS);

    original.css({
      'position' : 'initial',
      'top'      : 'initial',
      'left'     : 'initial',
      'right'    : 'initial',
      'bottom'   : 'initial',
      'z-index'  : 'initial',
      'margin'   : 'initial'
    });

    $('<div class="placeholder"></div>').css('visibility', 'hidden').append(original.clone()).appendTo(octopus);

    original.css('position', 'absolute');

    $.each(variations, function(key, variation) {
      $('<div class="' + variation + '" style="position: absolute; overflow: hidden; width: 100%;"></div>').append(original.clone()).appendTo(octopus);
    });

    original.parent().replaceWith(octopus);

    updateOctopus();
    
    $(window).scroll(function() {
      updateOctopus();
    });

    function updateOctopus() {

      const topPosY = octopus.offset().top;
      const botPosY = topPosY + octopus.outerHeight();

      let octopusParts = [];

      $.each(sections, function(key, section) {

        const sectionTopPosY = section.offset().top;
        const sectionBotPosY = sectionTopPosY + section.outerHeight();

        if(topPosY >= sectionTopPosY && topPosY <= sectionBotPosY) {

          for (var i = key; i < sections.length; i++) {

            const sectionTopPosY = sections[i].offset().top;
            const sectionBotPosY = sectionTopPosY + sections[i].outerHeight();

            let partTop, partBot;

            if(topPosY >= sectionTopPosY) {
              partTop = topPosY;
            } else if (sectionTopPosY <= botPosY) {
              partTop = sectionTopPosY;
            } else {
              break;
            }

            if(botPosY <= sectionBotPosY) {
              partBot = botPosY;
            } else if (sectionBotPosY >= topPosY) {
              partBot = sectionBotPosY;
            } else {
              break;
            }

            const part = {
              top: partTop,
              bot: partBot,
              octopus: sections[i].data(options.dataAttribute)
            };

            octopusParts.push(part);
          }

          return false;
        }
      });

      for(let i = 0; i < octopusParts.length; i++) {
        if(octopusParts[i + 1] && octopusParts[i + 1].octopus == octopusParts[i].octopus) {
          octopusParts[i].bot = octopusParts[i + 1].bot;
          octopusParts.splice(i + 1, 1);
        } 
      }

      octopus.children().not('.placeholder').each(function() {
        const $this = $(this);
        $this.css({
          'height': '0px',
          'top'   : '0'
        });
        $this.children().css('top', '0');
      });
    
      let totalHeight = 0;

      $.each(octopusParts, function(key, part) {

        let $part = octopus.children('.' + part.octopus);

        const height = part.bot - part.top;

        $part.css({
          'height': height + 'px',
          'top'   : totalHeight
        });

        $part.children().css('top', totalHeight * -1 + 'px');

        totalHeight += height;
      });
    }

    return {
      updateOctopus: function() {
        updateOctopus();
      }
    };

  };

}(jQuery));