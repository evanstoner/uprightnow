var svg;
var hostGroups;
var hosts;
var width;
var height;

var hostR = 75;
var hostSpacing = 25;
var colorScale = d3.scale.linear().domain([-1, 0, 1]).range(['#a00', '#aaa', '#0a0']);

$(function() {
  width = $(window).width();
  height = $(window).height() - $('.banner').height();

  svg = d3.select('svg#vis')
    .attr('width', width)
    .attr('height', height);

  $.getJSON('uprightnow/hosts', function(data) {
    hosts = data.hosts;
    hostGroups = svg.selectAll('g.host').data(hosts);

    hostGroups.enter().append('g')
        .attr('id', function(d) { return '_' + d._id; })
        .attr('class', 'host')
        .attr('transform', function(d, i) {
          var t = translate(d, i);
          return 'translate(' + t[0] + ',' + (-hostR - 5) + ')';
        });

    hostGroups.transition()
      .ease('elastic-ease-out')
      .duration(600)
      .delay(function(d, i) { return i * 100; })
      .attr('transform', function(d, i) {
        var t = translate(d, i);
        return 'translate(' + t[0] + ',' + t[1] + ')';
      });

    hostGroups.append('circle')
      .attr('r', 75)
      .attr('fill', function(d) { return colorScale(d.score); })
      .attr('stroke', function(d) { return d3.rgb(colorScale(d.score)).darker(0.5); });

    hostGroups.append('text')
      .text(function(d) { return d.name ? d.name : d.address; })
      .attr('text-anchor', 'middle')
      .attr('y', 5);

    pingHosts();
  });
});

function translate(d, i) {
  // initial offset from left side of page
  var t = [((hostR * 2 + hostSpacing) * i + (hostR + hostSpacing)), 100];
  // center
  t[0] += (width - ((hostR * 2) + hostSpacing) * hosts.length - hostSpacing) / 2;
  return t;
}

function pingHosts() {
  $.each(hosts, function(i, host) {

    $.getJSON('uprightnow/hosts/' + host._id + '/ping', function(data) {
      host.score = data.host.score;

      d3.select('#_' + host._id).select('circle').transition()
        .attr('fill', function(d) { return colorScale(d.score); })
        .attr('stroke', function(d) { return d3.rgb(colorScale(d.score)).darker(0.5); });
    });
  });
  setTimeout(pingHosts, 1000);
}
