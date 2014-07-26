var svg;
var hostGroups;
var hosts;
var width;
var height;

var hostR = 75;
var hostSpacing = 25;
var colorScale = d3.scale.linear().domain([-1, 0, 1]).range(['#a00', '#aaa', '#0a0']);

var hostFormVisible = false;
var editingHost;

$(function() {
  $('#newHost').click(function() {
    if (hostFormVisible)
      hideHostForm();
    else
      showHostForm();
  });
  $('#save').click(saveHost);

  width = $(window).width();
  height = $(window).height() - $('.banner').height();

  svg = d3.select('svg#vis')
    .attr('width', width)
    .attr('height', height);

  $.getJSON('uprightnow/hosts', function(data) {
    hosts = data.hosts;
    placeHosts();
    pingHosts();
  });
});

function showHostForm(host) {
  host = host || {};
  $('#name').val(host.name);
  $('#address').val(host.address);
  $('#hostForm').css({
    top: $('.banner').outerHeight(),
    right: '0px',
    display: 'block'
  });
  hostFormVisible = true;
  editingHost = host;
}

function hideHostForm() {
  $('#hostForm').css({
    display: 'none'
  });
  hostFormVisible = false;
  editingHost = null;
}

function saveHost() {
  editingHost.name = $('#name').val();
  editingHost.address = $('#address').val();

  if (editingHost._id) {
    // update existing host
    $.ajax({
      type: 'PUT',
      url: 'uprightnow/hosts/' + editingHost._id,
      data: editingHost,
      dataType: 'json',
      processData: false,
      success: function(data) {
        //TODO: update host after save
      }
    });
  } else {
    // create new host
    $.ajax({
      type: 'POST',
      url: 'uprightnow/hosts',
      data: JSON.stringify({ host: editingHost }),
      dataType: 'json',
      contentType: 'application/json',
      success: function(data) {
        hosts.push(data.host);
        placeHosts();
        hideHostForm();
      }
    });
  }
}

function placeHosts() {
  hostGroups = svg.selectAll('g.host').data(hosts);

  var newHostGroups = hostGroups.enter().append('g')
      .attr('id', function(d) { return '_' + d._id; })
      .attr('class', 'host')
      .attr('transform', function(d, i) {
        var t = translate(d, i);
        return 'translate(' + t[0] + ',' + (-hostR - 5) + ')';
      });

  newHostGroups.append('circle')
    .attr('r', 75)
    .attr('fill', function(d) { return colorScale(d.score); })
    .attr('stroke', function(d) { return d3.rgb(colorScale(d.score)).darker(0.5); });

  newHostGroups.append('text')
    .text(function(d) { return d.name ? d.name : d.address; })
    .attr('text-anchor', 'middle')
    .attr('y', 5);

  newHostGroups.on('mouseover', function(d) {
    d3.select(this).select('circle').transition()
      .attr('r', hostR + (hostSpacing * 0.3))
      .ease('elastic');
  }).on('mouseout', function() {
    d3.select(this).select('circle').transition()
      .attr('r', hostR)
      .ease('elastic');
  });

  hostGroups.transition()
    .ease('elastic-ease-out')
    .duration(600)
    .delay(function(d, i) { return i * 50; })
    .attr('transform', function(d, i) {
      var t = translate(d, i);
      return 'translate(' + t[0] + ',' + t[1] + ')';
    });
}

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
