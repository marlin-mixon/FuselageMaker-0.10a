'use strict';

/* Controllers */

angular.module('fuselageMaker.controllers', []).
controller('FuselageMakerCtrl', ['$scope', '$window', '$rootScope', function($scope, $window, $rootScope) {

$scope.version = '0.10a';
$scope.Math = window.Math;

$scope.set_xy_click = function(element) {
  element.x = $scope.theX;
  element.y = $scope.theY;
};
$scope.set_xy_ortho_arc_click = function(element, tmx) {
  element.push({x:$scope.theX, y:$scope.theY});
};
$scope.fix_zarc_selectors = function() {
  for (var i=0;i<$scope.sst.xsecs.length;i++) {
    $scope.add_zarc_selectors($scope.sst.xsecs[i].xsec);
  }
  $scope.add_zarc_selectors($scope.sst.side.bottom_outline);
  $scope.add_zarc_selectors($scope.sst.side.top_outline);
  $scope.add_zarc_selectors($scope.sst.top.left_outline);
  $scope.add_zarc_selectors($scope.sst.top.right_outline);
}
$scope.new_zarc = function() {
  var starter_zarc = [];
  $scope.add_zarc_selectors(starter_zarc);
  return starter_zarc;
};
$scope.add_zarc_selectors = function(obj) {
  obj.is_selected = false;
  obj.selected_element = -1;
}
$scope.set_xy_arc_click = function(args) {
  var element = args.element;
  $scope.sst2.active_arc = args.active_type;
  $scope.sst2.active_arc_index = element.length - 1;
  /*
  if ($scope.sst2.make_arc_type === 'normal') {
    element.push({x:$scope.theX, y:$scope.theY});
  } else if ($scope.sst2.make_arc_type === 'bezier') {
    var lastX = element[element.length-1].x;
    var lastY = element[element.length-1].y;
    var bx = lastX - (lastX - $scope.theX)/6;
    var by = lastY + (lastY - $scope.theX)/12;
    var cx = $scope.theX + (lastX - $scope.theX)/6;
    var cy = $scope.theY + (lastY - $scope.theX)/12;    
    element.push({x:$scope.theX, y:$scope.theY, b:{x:bx,y:by}, c:{x:cx,y:cy}, is_bezier:true});
  }
  */
  var is_bezier = true;
  if ($scope.sst2.make_arc_type === 'normal') {
    is_bezier = false;
  }
  $scope.insert_arc_node(element, {x:$scope.theX,y:$scope.theY}, is_bezier);
};
$scope.op_seq = [];
$scope.sst2 = {};
$scope.sst2.show_background = true;
$scope.sst2.show_bulkheads = false;
$scope.sst = {
  side: {
    version: $scope.version,
    zone: {
      lower_left: {
        instruct: 'Click lower left corner of side view box zone',
        x: null,
        y: null,
      },
      upper_right: {
        instruct: 'Click upper right corner of side view box zone',
        x: null,
        y: null,
      }
    },
    reference_line: {
      nose: {
        instruct: 'Click on nose end of side reference line',
        x: null,
        y: null
      },
      tail: {
        instruct: 'Click on tail end of side reference line',
        x: null,
        y: null
      }
    },
    top_outline: $scope.new_zarc(),
    bottom_outline: $scope.new_zarc(),
    display: {
      bulk: [],
      xsec: []
    }
  },
  top: {
    zone: {
      lower_left: {
        instruct: 'Click lower left corner of top/bottom view box zone',
        x: null,
        y: null
      },
      upper_right: {
        instruct: 'Click upper right corner of top/bottom view box zone',
        x: null,
        y: null
      }
    },
    reference_line: {
      nose: {
        instruct: 'Click on nose end of top/bottom reference line',
        x: null,
        y: null
      },
      tail: {
        instruct: 'Click on tail end of top/bottom reference line',
        x: null,
        y: null
      },
    },
    left_outline: $scope.new_zarc(),
    right_outline: $scope.new_zarc(),
    display: {
      bulk: [],
      xsec: []
    }
  },
  xsecs: [],
  xsec: {
    is_dirty: false
  },
  bulkheads: []
};

$scope.set_3view = function() {
  $scope.sst2.show_select_background = true;
  $scope.sst2.scope_id = 2;
};
$scope.add_image = function() {
  var f = $window.document.getElementById('background_file').files[0];
  var r = new FileReader();
  r.onloadend = function(e){
    var data = btoa(e.target.result);
    $scope.sst.background_3view = data;
    $scope.set_plan_image("img/p51_side.jpg", true)
    $scope.safe_apply();
  }
  r.readAsBinaryString(f);
};
// simple linear interpolation between two points
$scope.lerp = function(a, b, t) {
  var dest = {};
  dest.x = a.x + (b.x-a.x)*t;
  dest.y = a.y + (b.y-a.y)*t;
  return dest;
}
// evaluate a point on a bezier-curve. t goes from 0 to 1.0
$scope.bezier = function(a, b, c, d, t) {
  var dest = {};
  var ab;
  var bc;
  var cd;
  var abbc;
  var bccd;
  ab = $scope.lerp(a,b,t);           // point between a and b (green)
  bc = $scope.lerp(b,c,t);           // point between b and c (green)
  cd = $scope.lerp(c,d,t);           // point between c and d (green)
  abbc = $scope.lerp(ab,bc,t);       // point between ab and bc (blue)
  bccd = $scope.lerp(bc,cd,t);       // point between bc and cd (blue)
  dest = $scope.lerp(abbc,bccd,t);   // point on the bezier-curve (black)  
  return dest;
}

$scope.set_fuselage = function() {
  $scope.sst2.show_select_fuselage = true;
};
$scope.add_fuselage = function(){
  var f = $window.document.getElementById('fuselage_file').files[0];
  var r = new FileReader();
  r.onloadend = function(e){
    $scope.sst = JSON.parse(e.target.result);
    $scope.sst2.show_background = true;
    $scope.fix_zarc_selectors();
    $scope.safe_apply();
    // $scope.remove_flood_points();
  }
  r.readAsBinaryString(f);  // TODO: readAsBinaryString is deprecated, use readAsArrayBuffer() instead.
};

$scope.checkLineIntersection = function(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false
    };
    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator == 0) {
        return result;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));
/*
        // it is worth noting that this should be the same as:
        x = line2StartX + (b * (line2EndX - line2StartX));
        y = line2StartX + (b * (line2EndY - line2StartY));
        */
    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
        result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
        result.onLine2 = true;
    }
    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
};

$scope.get_extents = function(shape) {
  var minx=999999;
  var miny=999999;
  var maxx=-999999;
  var maxy=-999999;
  for (var i=0;i<shape.length;i++) {
    if (shape[i].x > maxx) { maxx = shape[i].x; }
    if (shape[i].x < minx) { minx = shape[i].x; }
    if (shape[i].y > maxy) { maxy = shape[i].y; }
    if (shape[i].y < miny) { miny = shape[i].y; }
  }
  return {min_point: {x:minx,y:miny}, max_point: {x:maxx,y:maxy}}
}

$scope.dist = function(p1, p2) {
  var dx = p1.x - p2.x;
  var dy = p1.y - p2.y;
  return Math.sqrt(dx*dx + dy*dy) ;
}

$scope.add_flood_points_zarc = function(xsec, n_total) {
  var i;  
  // get total length
  var total_dist = 0;
  for (i=xsec.xsec.length-1;i>=1;i--) {
    if (xsec.xsec[i].a.x === xsec.xsec[i-1].a.x && xsec.xsec[i].a.y === xsec.xsec[i-1].a.y) {
      xsec.xsec.splice(i,1);  // remove point because it's identical to neighbor
      continue;
    }
    var the_dist = $scope.dist(xsec.xsec[i].a, xsec.xsec[i-1].a);
    if (the_dist === 0) {
      xsec.xsec.splice(i,1);  // remove point because it's identical to neighbor
      continue;
    }
    total_dist += the_dist;
    xsec.xsec[i].dist = the_dist;
  }
  var n_points = 0;
  var flooded_xsec = [];
  for (i=0;i<xsec.xsec.length-1;i++) {
    var segment_dist = $scope.dist(xsec.xsec[i].a, xsec.xsec[i].d);
    var ratio_dist = segment_dist / total_dist;
    var segment_points = Math.round(n_total * ratio_dist);
    var micro_dist = segment_dist / segment_points;
    for (var j=0;j<segment_points;j++) {
      var t = (micro_dist*j) / segment_dist;
      var new_point;
      if (xsec.xsec[i].is_bezier && xsec.xsec[i].a && xsec.xsec[i].b && xsec.xsec[i].c && xsec.xsec[i].d) {
        new_point = $scope.bezier(xsec.xsec[i].a, xsec.xsec[i].b, xsec.xsec[i].c, xsec.xsec[i].d, t);
      } else if (xsec.xsec[i].a && xsec.xsec[i].d) {
        new_point = $scope.lerp(xsec.xsec[i].a, xsec.xsec[i].d, t)
      }
      n_points++;
      flooded_xsec.push(new_point);
    }
  }

  return flooded_xsec;
}

$scope.add_flood_points_newest = function(xsec, n_total) {
  var i;
  // get total length
  var total_dist = 0;
  for (i=xsec.xsec.length-1;i>=1;i--) {
    if (xsec.xsec[i].a.x === xsec.xsec[i-1].a.x && xsec.xsec[i].a.y === xsec.xsec[i-1].a.y) {
      xsec.xsec.splice(i,1);  // remove point because it's identical to neighbor
      continue;
    }
    var the_dist = $scope.dist(xsec.xsec[i].a, xsec.xsec[i-1].a);
    if (the_dist === 0) {
      xsec.xsec.splice(i,1);  // remove point because it's identical to neighbor
      continue;
    }
    total_dist += the_dist;
    xsec.xsec[i].dist = the_dist;
  }
  var n = n_total + xsec.xsec.length;
  // var n = n_total;
  var short_dist = total_dist / n;
  var flooded_xsec = [{x:xsec.xsec[0].a.x, y:xsec.xsec[0].a.y}];
  var accum_dist = short_dist;
  var ii;
  var accum_total_dist = 0;
  i = 1;
  for (i=1;i<xsec.xsec.length;i++) {
    var x1 = xsec.xsec[i-1].a.x;
    var y1 = xsec.xsec[i-1].a.y;
    if (!xsec.xsec[i].is_bezier) {
      var theta = Math.atan2( (xsec.xsec[i].a.y - y1), (xsec.xsec[i].a.x - x1) );
    }
    while (accum_dist < xsec.xsec[i].dist) {
      if (xsec.xsec[i].is_bezier) {
        var t = accum_dist / total_dist;
        var bzp = $scope.bezier(xsec.xsec[i-1].a,xsec.xsec[i-1].b,xsec.xsec[i-1].c,xsec.xsec[i-1].d,t);
        x2 = bzp.x;
        y2 = bzp.y;
      } else {
        var x2 = x1 + Math.cos(theta)*accum_dist;
        var y2 = y1 + Math.sin(theta)*accum_dist;
      }
      flooded_xsec.push({x:x2,y:y2});  // This is not a zarc, it's a bunch of short line segments.
      accum_dist += short_dist;
      accum_total_dist += short_dist;
    }
    flooded_xsec.pop();  //Remove last point because it went too far
    var partial_dist = $scope.dist({x:x2,y:y2}, {x:xsec.xsec[i].x,y:xsec.xsec[i].y});
    //var remain_dist = xsec.xsec[i].dist - partial_dist;
    accum_dist = partial_dist;
    ii = i;
  }
  flooded_xsec.push(xsec.xsec[ii].a);
  return flooded_xsec;
}

$scope.plot_bulkheads = function(location_xy) {
  // Not much to do here except set the offsets and turn the bulkheads on.  partial1.html does the true plotting
  var spacingx = 15;
  // location_xy={x:0,y:0};  // debug
  // $scope.sst2.bulkhead_placement_xy = location_xy;
  $scope.sst2.show_bulkheads = true;
  var run_pointx = 0;
  for (var i=0;i<$scope.sst.bulkheads.length;i++) {
    var b = $scope.sst.bulkheads[i];
    b.extents = $scope.get_extents(b.shape);
    b.display_offset = {x:(location_xy.x + run_pointx), y:location_xy.y};
    run_pointx += (b.extents.max_point.x - b.extents.min_point.x) + spacingx;
  }
  $scope.sst.show_final_bulkheads = true;
}

$scope.generate_bulkheads_simplified = function() {
  var i;
  var j;
  $scope.sst2.bulkhead_context_on = true;
  var top_tmxs = $scope.get_tmx_horizontal($scope.sst.top.reference_line.nose, $scope.sst.top.reference_line.tail);
  var side_tmxs = $scope.get_tmx_horizontal($scope.sst.side.reference_line.nose, $scope.sst.side.reference_line.tail);
  var ortho_side_top_outline = $scope.transform_zarc($scope.sst.side.top_outline, side_tmxs.tmx);
  var ortho_side_bottom_outline = $scope.transform_zarc($scope.sst.side.bottom_outline, side_tmxs.tmx);
  var ortho_top_left_outline = $scope.transform_zarc($scope.sst.top.left_outline, top_tmxs.tmx);
  var greater;
  var lesser;

  var bs = $scope.sst.bulkheads;
  var xs = $scope.sst.xsecs;

  for (i=0; i<bs.length; i++) {
    var b = bs[i];
    var gmode = $scope.sst2.generation_mode;
    var xsec_list = [];
    for (j=0; j<xs.length; j++) {
      xsec_list.push({x:xs[j].station[0].x, index:j});
    }
    if (xsec_list.length < 2) {
      alert("We don't have enough cross-sections to do anything.  We must have a minimum of 2.");
      return;
    }
    xsec_list.push({x:bs[i].x, index:-1});
    xsec_list.sort(function(a, b) {
      return a.x - b.x;
    });
    for (j=0; j<xsec_list.length; j++) {
      var xs_index = xsec_list[j].index
      if (xs_index === -1) {
        if (gmode === 'normal' ) {
          if (j === 0) {
            alert("We cannot interpolate bulkhead #"+i+" because it doesn't have cross-sections on either side. Either delete it and recreate it for extrapolation or better yet, add a new cross section closer to the nose.");
            return;
          } else if (j === xsec_list.length-1) {
            alert("We cannot interpolate bulkhead #"+i+" because it doesn't have cross-sections on either side. Either delete it and recreate it for extrapolation or better yet, add a new cross section closer to the tail.");
            return;
          }
          lesser = xs[xsec_list[j-1].index];
          greater = xs[xsec_list[j+1].index];
        } else if (gmode === 'extrapolate tail side') {
          if (j >= xsec_list.length - 3) {
            alert("We cannot do a tail-side extrapolation of bulkhead #"+i+" because it needs 2 cross-sections beyond it towards the tail.");
            return;            
          }
          lesser = xs[xsec_list[j+1].index];
          greater = xs[xsec_list[j+2].index];
        } else if (gmode === 'extrapolate nose side') {
          if (j <= 1) {
            alert("We cannot do a nose-side extrapolation of bulkhead #"+i+" because it needs 2 cross-sections in front of it towards the nose.");
            return;            
          }
          lesser = xs[xsec_list[j-2].index];
          greater = xs[xsec_list[j-1].index];
        }
      }
      // Determine if we have generated flood points for the cross section yet and add if needed
      if (xs_index !== -1 && !xs[xs_index].flood_points) {
        xs[xs_index].flood_points = $scope.add_flood_points_zarc(xs[xs_index], 200);
      }
    }
    // we have the bulkhead location and the two nearest xsecs
    var new_bulkhead = [];
    var end = lesser.flood_points.length > greater.flood_points.length ? greater.flood_points.length : lesser.flood_points.length;
    for (j=0;j<end;j++) {
      // For 3d, we just do this twice from two points of view.
      var jlesser = j; var jgreater = j;
      if (j === end - 1) {
        jlesser = lesser.flood_points.length - 1;
        jgreater = greater.flood_points.length -1;
      }
      var pvx = $scope.linear_interpolation({x:lesser.station[0].x,y:lesser.flood_points[jlesser].x},
                                            {x:greater.station[0].x,y:greater.flood_points[jgreater].x},
                                            b.x);
      var pvy = $scope.linear_interpolation({x:lesser.station[0].x,y:lesser.flood_points[jlesser].y},
                                            {x:greater.station[0].x,y:greater.flood_points[jgreater].y},
                                            b.x);
      if (!isNaN(pvx) && !isNaN(pvy)) {  // Fix to symptom of larger issue
        new_bulkhead.push({x:pvx,y:pvy});
      }
    }
    // Determine its current width/height
    b.extents = $scope.get_extents(new_bulkhead);

    /*
    var result = $scope.is_point_in_top_or_side(b);
    if (result.location === 'none' || result.location === 'all') {
      alert("Bulkhead location is not in top/bottom nor side view zones");
      return;
    }
    // args {tmxs: top_tmxs, recvr: top_disp_recvr}
    if (result.location === "top") {
      var ortho_point = $scope.transform(b, top_tmxs.tmx);  // make sure passing bulkhead as a point is ok
    } else if (result.location === "side") {
      var ortho_point = $scope.transform(b, side_tmxs.tmx); // make sure passing bulkhead as a point is ok
    }
    */
    var ortho_point = b;

    // Need to scale bulkhead x and y to fit side and top outlines.
    var b4_width = b.extents.max_point.x - b.extents.min_point.x;
    var x_top_ref = $scope.transform($scope.sst.top.reference_line.nose, top_tmxs.tmx);
    var width_y = $scope.zarc_as_function(ortho_point.x, ortho_top_left_outline).y
    var desired_width = Math.abs(width_y - x_top_ref.x);
    var x_scale = desired_width / b4_width;

    var b4_height = b.extents.max_point.y - b.extents.min_point.y;
    var y_side_1 = $scope.zarc_as_function(ortho_point.x, ortho_side_top_outline);
    var y_side_2 = $scope.zarc_as_function(ortho_point.x, ortho_side_bottom_outline);
    var desired_height = Math.abs(y_side_1.y - y_side_2.y);
    var y_scale = desired_height / b4_height;

    var trans_x = -b.extents.min_point.x;
    var trans_y = -b.extents.min_point.y;

    var tmx1 = [
                 [1, 0, trans_x],
                 [0, 1, trans_y],
                 [9, 0, 1      ]
               ];

    var tmx2 = [
                 [x_scale, 0,       0],
                 [0,       y_scale, 0],
                 [9,       0,       1]
               ];

    //var tmx_1_2 = math.dotMultiply(tmx1, tmx2);
    var newer_bulkhead = [];
    for (j=0;j<new_bulkhead.length;j++) {
      new_bulkhead[j].x += trans_x;
      new_bulkhead[j].y += trans_y;
      new_bulkhead[j].x *= x_scale;
      new_bulkhead[j].y *= y_scale;
      //var scaled = math.multiply(tmx_1_2, [[new_bulkhead[j].x],[new_bulkhead[j].y],[1]] );
      //scaled = math.multiply(tmx2, [[scaled[0][0]],[scaled[1][0]],[1]] );
      //var p = {x:scaled[0][0], y:scaled[1][0]};
      newer_bulkhead.push(new_bulkhead[j]);
    }

    b.shape = newer_bulkhead;   
  }
  // Ask where the bulkheads will go

  $scope.sst2.bulkhead_plot_location = {x:220,y:$scope.sst2.min_bulkead_height};
  //$scope.set_point($scope.sst2.bulkhead_plot_location, false, 'Click where you want the bulkheads to be placed (they fill in horizontally to the right)');
  $scope.op_seq.push({
    handler: $scope.plot_bulkheads,
    dest: $scope.sst2.bulkhead_plot_location,
    is_loop: false,
    dont_want_coord: true,
    instruction: 'Pretty bulkheads!'
  });
  $scope.get_coord_interval = setInterval($scope.proc_op_seq, 500);
  $scope.get_coord_live = true;  
}

$scope.clear_op = function(mode) {
  if (mode !== 'keep_bulkheads') {
    $scope.sst.show_final_bulkheads = false;
    $scope.sst2.show_bulkheads = false;
  }
  $scope.sst2.show_select_fuselage = false;
  $scope.sst2.show_select_background = false;
  $scope.sst2.generation_mode = 'normal';
  $scope.sst2.show_bulkhead_controls = false;
  $scope.sst2.show_button = false;
  $scope.op_seq = [];
};

$scope.safe_apply = function() {
  if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
    $scope.$apply();
  }
};

$scope.done_button = function() {
  $scope.get_coord_live = false;
  $scope.sst2.show_bulkhead_controls = false;
  $scope.sst2.show_button = false;
  $scope.undoable = undefined;
  $scope.op_seq = [];
};

$scope.undo_point = function() {
  if ($scope.undoable) {
    var throw_away = $scope.undoable.pop();
    var last_point = $scope.undoable[ $scope.undoable.length - 1 ];
    delete last_point.b;
    delete last_point.c;
    delete last_point.d;
  }
  $scope.undoable.selected_element = $scope.undoable.length - 2;
};

$scope.set_plan_image = function(image_file, is_on) {
  $scope.sst.plan_image = image_file;
  $scope.sst2.show_background = is_on;
};

$scope.proc_op_seq = function() {

  $scope.instruction = "";
  if (!$scope.get_coord_live) {
    clearInterval($scope.get_coord_interval);
    $scope.safe_apply();
    return;
  }
  if ($scope.op_seq.length === 0) {
    if ($scope.get_coord_live) {
      clearInterval($scope.get_coord_interval);
      $scope.get_coord_live = false;
    }
    $scope.safe_apply();
    return;
  }
  $scope.instruction = $scope.op_seq[0].instruction;
  if($scope.coord_available || $scope.op_seq[0].dont_want_coord) {
    $scope.op_seq[0].handler($scope.op_seq[0].dest,$scope.op_seq[0].index);
    if ($scope.op_seq[0].handler2) {
      $scope.op_seq[0].handler2($scope.op_seq[0].args2);
    }
    if ($scope.op_seq[0].handler3) {
      $scope.op_seq[0].handler3($scope.op_seq[0].args3);  // Not used yet?
    }
    if (!$scope.op_seq[0].is_loop) {
      $scope.op_seq.shift();
    }
    $scope.coord_available = false;
  }
  $scope.safe_apply();
};

$scope.set_point = function(element, ok_to_go, instruct) {
  $scope.is_dirty = true;
  element.x = null; element.y = null;
  $scope.coord_available = false;
  $scope.op_seq = [];
  $scope.op_seq.push({
    handler: $scope.set_xy_click,
    dest: element,
    is_loop: false,
    instruction: instruct
  });
  if (ok_to_go) {
    $scope.get_coord_interval = setInterval($scope.proc_op_seq, 500);
    $scope.get_coord_live = true;
  }
};

$scope.set_box = function(element) {
  $scope.is_dirty = true;
  element.lower_left.x = null; element.lower_left.y = null;
  element.upper_right.x = null;element.upper_right.y = null;
  $scope.coord_available = false;
  $scope.op_seq = [];
  $scope.op_seq.push({
    handler: $scope.set_xy_click,
    dest: element.lower_left,
    is_loop: false,
    instruction: element.lower_left.instruct
  });
  $scope.op_seq.push({
    handler: $scope.set_xy_click,
    dest: element.upper_right,
    is_loop: false,
    instruction: element.upper_right.instruct
  });
  $scope.get_coord_interval = setInterval($scope.proc_op_seq, 500);
  $scope.get_coord_live = true;
};

$scope.set_line = function(element) {
  $scope.is_dirty = true;
  element.nose.x = null; element.nose.y = null;
  element.tail.x = null; element.tail.y = null;
  $scope.coord_available = false;
  $scope.op_seq = [];
  $scope.op_seq.push({
    handler: $scope.set_xy_click,
    dest: element.nose,
    is_loop: false,
    instruction: element.nose.instruct
  });
  $scope.op_seq.push({
    handler: $scope.set_xy_click,
    dest: element.tail,
    is_loop: false,
    instruction: element.tail.instruct
  });
  $scope.get_coord_interval = setInterval($scope.proc_op_seq, 500);
  $scope.get_coord_live = true;
};

$scope.set_arc = function(element, clean, active_type) {
  $scope.undoable = element;
  $scope.sst2.show_bulkhead_controls = false;
  //$scope.sst2.show_button = true;
  $scope.sst2.the_set_context = 'make-arc';
  $scope.is_dirty = true;
  for (var i=element.length;i>=0;i--) {
    element.pop();
  }
  $scope.coord_available = false; // turn off any existing point gathering
  if (clean) {
    $scope.op_seq = [];
  }
  $scope.op_seq.push({
    handler:$scope.set_xy_arc_click,
    dest: {element:element, active_type:active_type},
    is_loop: true,
    instruction: 'Click to add new point. Click done button when done.'
  });
  $scope.get_coord_interval = setInterval($scope.proc_op_seq, 500);
  $scope.get_coord_live = true;
};

$scope.is_point_in_top_or_side = function(point) {
  var in_top_zone = false;
  var in_side_zone = false;
  if (!$scope.sst.side.zone) {
    return {location:"none", message:"Need to digitize side view zone first."};
  }
  if (!$scope.sst.top.zone) {
    return {location:"none", message:"Need to digitize top/bottom view zone first."};
  }
  if (point.x >= $scope.sst.side.zone.lower_left.x &&
      point.x <= $scope.sst.side.zone.upper_right.x &&
      point.y >= $scope.sst.side.zone.upper_right.y &&
      point.y <= $scope.sst.side.zone.lower_left.y) {
    in_side_zone = true;
  }
  if (point.x >= $scope.sst.top.zone.lower_left.x &&
      point.x <= $scope.sst.top.zone.upper_right.x &&
      point.y >= $scope.sst.top.zone.upper_right.y &&
      point.y <= $scope.sst.top.zone.lower_left.y) {
    in_top_zone = true;
  }
  if (in_side_zone && in_top_zone) {
    return {location:"all", message:"Side view and top/bottom view zones overlap.  can't determine whether point is in side or top/bottom view zones."}
  }
  if (!in_side_zone && !in_top_zone) {
    return {location:"none", message:"Point was not digitized in either the side view or top/bottom view zones."}
  }
  if (in_side_zone) {
    return {location:"side", message:""}
  }
  if (in_top_zone) {
    return {location:"top", message:""}
  }
};

$scope.linear_interpolation = function(p1, p2, x) {  // Also does extrapolation
  if (p1.x === p2.x) {         // This is an input error but we provide a fault-tolerant result
    return (p1.y + p2.y) / 2;  // if the x's coincide just return the average of the y's
  }
  var rise = p2.y - p1.y;
  var run = p2.x - p1.x;
  var slope = rise/run;
  var y = ((x - p1.x) * slope) + p1.y
  return y;
};

$scope.outline_as_function = function(x, ortho_outline) {
  for (var i=1;i<ortho_outline.length;i++) {
    if (i===0 && x < ortho_outline[0].x) {
      return {y:999999, message:'Point location is outside the outline range (beyond nose)'};
    }
    if (x > ortho_outline[i-1].x && x < ortho_outline[i].x) {
      var y = $scope.linear_interpolation( ortho_outline[i-1], ortho_outline[i], x);
      return {y:y, message:''};
    }
  }
  return {y:999999, message:'Point location is outside the outline range (beyond tail)'};
};

$scope.bezierCoeffs = function(P0,P1,P2,P3) {
  var Z = Array();
  Z[0] = -P0 + 3*P1 + -3*P2 + P3; 
  Z[1] = 3*P0 - 6*P1 + 3*P2;
  Z[2] = -3*P0 + 3*P1;
  Z[3] = P0;
  return Z;
}
$scope.sortSpecial = function(a) {
    var flip;
    var temp;
    
    do {
        flip=false;
        for (var i=0;i<a.length-1;i++) {
            if ((a[i+1]>=0 && a[i]>a[i+1]) ||
                (a[i]<0 && a[i+1]>=0))
            {
                flip=true;
                temp=a[i];
                a[i]=a[i+1];
                a[i+1]=temp;   
            }
        }
    } while (flip);
  return a;
}

$scope.cubicRoots = function(P) {
  var a=P[0];
  var b=P[1];
  var c=P[2];
  var d=P[3];
  
  var A=b/a;
  var B=c/a;
  var C=d/a;

    var Q, R, D, S, T, Im;

    var Q = (3*B - Math.pow(A, 2))/9;
    var R = (9*A*B - 27*C - 2*Math.pow(A, 3))/54;
    var D = Math.pow(Q, 3) + Math.pow(R, 2);    // polynomial discriminant

    var t=Array();
  
    if (D >= 0)                                 // complex or duplicate roots
    {
        var S = sgn(R + Math.sqrt(D))*Math.pow(Math.abs(R + Math.sqrt(D)),(1/3));
        var T = sgn(R - Math.sqrt(D))*Math.pow(Math.abs(R - Math.sqrt(D)),(1/3));

        t[0] = -A/3 + (S + T);                    // real root
        t[1] = -A/3 - (S + T)/2;                  // real part of complex root
        t[2] = -A/3 - (S + T)/2;                  // real part of complex root
        Im = Math.abs(Math.sqrt(3)*(S - T)/2);    // complex part of root pair   
        
        /*discard complex roots*/
        if (Im!=0)
        {
            t[1]=-1;
            t[2]=-1;
        }
    
    }
    else                                          // distinct real roots
    {
        var th = Math.acos(R/Math.sqrt(-Math.pow(Q, 3)));
        
        t[0] = 2*Math.sqrt(-Q)*Math.cos(th/3) - A/3;
        t[1] = 2*Math.sqrt(-Q)*Math.cos((th + 2*Math.PI)/3) - A/3;
        t[2] = 2*Math.sqrt(-Q)*Math.cos((th + 4*Math.PI)/3) - A/3;
        Im = 0.0;
    }
    
    /*discard out of spec roots*/
  for (var i=0;i<3;i++) 
        if (t[i]<0 || t[i]>1.0) t[i]=-1;
                
  /*sort but place -1 at the end*/
    t=$scope.sortSpecial(t);
    
  console.log(t[0]+" "+t[1]+" "+t[2]);
    return t;
}

/*computes intersection between a cubic spline and a line segment*/
$scope.computeIntersections = function(a, b, c, d, p1, p2) {

    var A=p2.y-p1.y;      //A=y2-y1
    var B=p1.x-p2.x;      //B=x1-x2
    var C=p1.x*(p1.y-p2.y) + 
          p1.y*(p2.x-p1.x);  //C=x1*(y1-y2)+y1*(x2-x1)
 
    var bx = $scope.bezierCoeffs(a.x,b.x,c.x,d.x);
    var by = $scope.bezierCoeffs(a.y,b.y,c.y,d.y);
 
    var P = Array();
    P[0] = A*bx[0]+B*by[0];   /*t^3*/
    P[1] = A*bx[1]+B*by[1];   /*t^2*/
    P[2] = A*bx[2]+B*by[2];   /*t*/
    P[3] = A*bx[3]+B*by[3] + C; /*1*/
 
    var r=$scope.cubicRoots(P);
 
    /*verify the roots are in bounds of the linear segment*/
    var pts = [];  
    for (var i=0;i<3;i++) {
        var t=r[i];
 
        var x=bx[0]*t*t*t+bx[1]*t*t+bx[2]*t+bx[3];  // x
        var y=by[0]*t*t*t+by[1]*t*t+by[2]*t+by[3];  // y

        pts.push({x:x,y:y});
 
        //above is intersection point assuming infinitely long line segment,
        //  make sure we are also in bounds of the line*/
        /* 
        var s;
        if ((lx[1]-lx[0])!=0)           //if not vertical line
            s=(X[0]-lx[0])/(lx[1]-lx[0]);
        else
            s=(X[1]-ly[0])/(ly[1]-ly[0]);
 
        //in bounds?
        if (t<0 || t>1.0 || s<0 || s>1.0) {
            X[0]=-100;  //move off screen
            X[1]=-100;
        }
 
        //move intersection point
        //I[i].setAttributeNS(null,"cx",X[0]);
        //I[i].setAttributeNS(null,"cy",X[1]);
        */
    }
    return pts;    
}
$scope.zarc_as_function = function(x, zarc) {
  var i;
  var p;
  var t;
  if (x < zarc[0].a.x) {
    return {y:999999, message:'Point location is outside the outline range (beyond nose)'};
  }
  if (x > zarc[zarc.length-2].d.x) {
    return {y:999999, message:'Point location is outside the outline range (beyond tail)'};
  }
  for (i=0;i<zarc.length;i++) {
    if (zarc[i].a.x <= x && zarc[i].d.x >= x) {
      if (!zarc[i].is_bezier) {
        t = (x - zarc[i].a.x) / (zarc[i].d.x - zarc[i].a.x);
        p = $scope.lerp(zarc[i].a, zarc[i].d, t)
      } else {
        var p1 = {x:x, y:200};
        var p2 = {x:x, y:-200};
        var ps = $scope.computeIntersections(zarc[i].a, zarc[i].b, zarc[i].c, zarc[i].d, p1, p2);
        p = ps[0];
        //p = $scope.bezier(zarc[i].a, zarc[i].b, zarc[i].c, zarc[i].d, t);

      }
      return {y:p.y, message:''};
    }
  }
}

$scope.check_prereq_xsec_bulkhead = function(type) {
  if (type === 'bulkhead') {
    if ($scope.sst.xsec.is_dirty) {
      alert("Need to run 'Cleanup Cross Sections' first.");
      return false;
    } else if ($scope.sst.xsecs.length < 2) {
      alert("Need at least 2 cross sections before any work with bulkheads can be done");
      return false;
    }
  } else if (type === 'xsec') {

  }
  if ($scope.sst.top.left_outline.length === 0 || $scope.sst.side.bottom_outline.length === 0 || $scope.sst.side.top_outline.length === 0) {
    alert("Need to define both the side-view outline and the top-view outline");
    return false;
  }
  return true;
};

$scope.make_display_point = function(args) {
  var point = {x:$scope.theX, y:$scope.theY};
  var result = $scope.is_point_in_top_or_side(point);
  if (result.location === 'none' || result.location === 'all') {
    alert(result.message);
    if (!args.is_bulkhead) {
      // abort this operation if this is a xsec
      $scope.op_seq = [];
    }
    return;
  }
  // args {tmxs: top_tmxs, recvr: top_disp_recvr}
  if (result.location === "top") {
    var ortho_point = $scope.transform(point, args.top_tmxs.tmx);
  } else if (result.location === "side") {
    var ortho_point = $scope.transform(point, args.side_tmxs.tmx);
  }
  // save point
  args.main_recvr.push(ortho_point);

  var ortho_top_left_outline = $scope.transform_zarc($scope.sst.top.left_outline, args.top_tmxs.tmx);
  var ortho_side_bottom_outline = $scope.transform_zarc($scope.sst.side.bottom_outline, args.side_tmxs.tmx);
  var ortho_side_top_outline = $scope.transform_zarc($scope.sst.side.top_outline, args.side_tmxs.tmx);
  var ortho_top_center_line = $scope.transform($scope.sst.top.reference_line.nose, args.top_tmxs.tmx);
  var ortho_center_point = {x:ortho_point.x, y:ortho_top_center_line.y};
  var res_outline = $scope.zarc_as_function(ortho_point.x, ortho_top_left_outline);
  var res_top_outline = $scope.zarc_as_function(ortho_point.x, ortho_side_top_outline);
  var res_bottom_outline = $scope.zarc_as_function(ortho_point.x, ortho_side_bottom_outline);
  if (res_outline.message !== "") {
    alert(res_outline.message);
    return;
  }
  // top view
  var ortho_edge_point = {x:ortho_point.x , y:res_outline.y};
  var edge_point = $scope.transform(ortho_edge_point, args.top_tmxs.inv_tmx);
  var center_point = $scope.transform(ortho_center_point, args.top_tmxs.inv_tmx);
  args.top_recvr.push({x1:center_point.x, y1:center_point.y, x2:edge_point.x, y2:edge_point.y});
  // side view
  var ortho_top_edge_point = {x:ortho_point.x , y:res_top_outline.y};
  var top_edge_point =   $scope.transform(ortho_top_edge_point, args.side_tmxs.inv_tmx);
  var ortho_bottom_edge_point = {x:ortho_point.x , y:res_bottom_outline.y};
  var bottom_edge_point =   $scope.transform(ortho_bottom_edge_point, args.side_tmxs.inv_tmx);
  args.side_recvr.push({x1:top_edge_point.x, y1:top_edge_point.y, x2:bottom_edge_point.x, y2:bottom_edge_point.y});
};

// This is used for both Cross Sections and Bulkheads
$scope.set_arc_stations = function(recvr, top_disp_recvr, side_disp_recvr, top_tmxs, side_tmxs, is_many, is_bulkhead) {
  $scope.undoable = recvr;
  $scope.sst2.show_bulkhead_controls = is_bulkhead;
  $scope.sst2.show_button = true;
  $scope.is_dirty = true;
  $scope.coord_available = false; // turn off any existing point gathering

  var args2 = {top_tmxs: top_tmxs, top_recvr: top_disp_recvr, side_tmxs: side_tmxs, side_recvr: side_disp_recvr, is_bulkhead: is_bulkhead, main_recvr:recvr};
  var the_instruction;
  if (is_bulkhead) {
    the_instruction = 'Click to locate new bulkhead in side or top/bottom view.';
  } else {
    the_instruction = 'Click to locate new cross section in side or top/bottom view.';
  }
  if (is_many) {
    the_instruction += 'Click to add point to the cross-section.  Press done button when done.'
  }
  if (is_bulkhead) {
    $scope.op_seq.push({
      handler:$scope.make_display_point,
      handler2:$scope.set_generation_mode,
      dest: args2,
      is_loop: is_many,
      instruction: the_instruction
    });
  } else {
    $scope.op_seq.push({
      handler:$scope.make_display_point,
      dest: args2,
      is_loop: is_many,
      instruction: the_instruction
    });
  }
};

$scope.transform_xsec_points = function() {
  var x_index = $scope.sst.xsecs.length-1;
  var the_xsec = $scope.sst.xsecs[x_index];
  var is_in_top = $scope.is_point_in_view_zone('top', the_xsec.station[0]);
  var is_in_side = $scope.is_point_in_view_zone('side', the_xsec.station[0]);
  if (!is_in_top && !is_in_side) {
    alert('Your locating fore/aft coordinate for your xsec is in neither the top/bottom nor side view zones.');
  }
  var top_ref = $scope.sst.top.reference_line;
  var top_tmxs = $scope.get_tmx_horizontal(top_ref.nose, top_ref.tail);
  var side_ref = $scope.sst.side.reference_line;
  var side_tmxs = $scope.get_tmx_horizontal(side_ref.nose, side_ref.tail);
  var tmxs;
  if (is_in_top) {
    tmxs = top_tmxs;
  } else {
    tmxs = side_tmxs;
  }
  the_xsec.ortho_station = $scope.transform(the_xsec.station[0], tmxs.tmx);
  //Now transform the arc coordinates so the center is at 0,0
  var center_y;
  var ortho_top_point = $scope.transform(the_xsec.xsec[0].a, side_tmxs.tmx);
  var ortho_nose_point = $scope.transform(top_ref.nose, side_tmxs.tmx);
  center_y = ortho_top_point.y - ortho_nose_point.y;
  var arc_tmxs = $scope.get_tmx_xsec(the_xsec.xsec[0].a, the_xsec.xsec[the_xsec.xsec.length-1], center_y);
  the_xsec.ortho_shape = [];
  // need to transform_zarc
  the_xsec.ortho_shape = $scope.transform_zarc(the_xsec.xsec, side_tmxs.tmx);
  //  for (var i=0;i<the_xsec.xsec.length;i++) {
  //    the_xsec.ortho_shape.push($scope.transform(the_xsec.xsec[i],side_tmxs.tmx));
  //  } 

};
$scope.set_generation_mode = function() {
  $scope.sst.bulkheads[$scope.sst.bulkheads.length-1].generation_mode = $scope.sst2.generation_mode;
};
$scope.set_bulkhead_arc = function(recvr, top_ref, side_ref) {
  if (!$scope.check_prereq_xsec_bulkhead('bulkhead')) { return; }
  var top_tmxs = $scope.get_tmx_horizontal(top_ref.reference_line.nose, top_ref.reference_line.tail);
  var side_tmxs = $scope.get_tmx_horizontal(side_ref.reference_line.nose, side_ref.reference_line.tail);
  $scope.set_arc_stations(recvr, top_ref.display.bulk, side_ref.display.bulk, top_tmxs, side_tmxs, true, true);
  $scope.get_coord_interval = setInterval($scope.proc_op_seq, 500);
  $scope.get_coord_live = true;
};

$scope.set_xsec_point_and_arc = function(xsec_recvr, top_ref, side_ref) {
  if (!$scope.check_prereq_xsec_bulkhead('xsec')) { return; }
  var top_tmxs = $scope.get_tmx_horizontal(top_ref.reference_line.nose, top_ref.reference_line.tail);
  var side_tmxs = $scope.get_tmx_horizontal(side_ref.reference_line.nose, side_ref.reference_line.tail);
  var xsec_id = xsec_recvr.push({station:[],xsec:[]});
  var xsec_index = xsec_id - 1;

  $scope.is_dirty = true;
  $scope.op_seq = [];

  $scope.set_arc_stations(xsec_recvr[xsec_index].station, $scope.sst.top.display.xsec, $scope.sst.side.display.xsec, top_tmxs, side_tmxs, false, false);
  $scope.set_arc(xsec_recvr[xsec_index].xsec, false);
  $scope.get_coord_interval = setInterval($scope.proc_op_seq, 500);
  $scope.get_coord_live = true;
};

$scope.save_data = function() {
  localStorage.setItem('fuselage', JSON.stringify($scope.sst) );
};
$scope.restore_data = function() {
  var do_it = true;
  if ($scope.is_dirty) {
    if (!window.confirm("You have made changes.  Are you sure you want to restore on top of your changes?")) {
      do_it = false;
    }
  }
  if (do_it) {
    if (JSON.parse(localStorage.getItem('fuselage')) === null) {
      alert("No fuselage data available for quick restore");
    } else { 
      $scope.sst = JSON.parse(localStorage.getItem('fuselage') );
      $scope.sst2.show_background = true;
      $scope.fix_zarc_selectors();
      $scope.safe_apply();
    }
  }
};
$scope.background_image = function() {
  if ($scope.sst.background_3view.length > 0) {
    return 'data:image/jpg;base64,'+$scope.sst.background_3view;
  } else {
    return $scope.sst.plan_image;
  }
}
$scope.make_svg_file = function() {
  $scope.sst2.svg = $window.document.getElementById('svg-bulkheads').outerHTML;
};
$scope.make_fuselage = function() {
  $scope.fuselage_serialized = JSON.stringify($scope.sst);
};
$scope.download_file = function(content, file_name, mime_type) {
  var a = document.createElement('a');
  mime_type = mime_type || 'application/octet-stream';

  if (navigator.msSaveBlob) { // IE10
    return navigator.msSaveBlob(new Blob([content], { type: mime_type }),     fileName);
  } else if ('download' in a) { //html5 A[download]
    a.href = 'data:' + mime_type + ',' + encodeURIComponent(content);
    a.setAttribute('download', file_name);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } else { //do iframe dataURL download (old ch+FF):
    var f = document.createElement('iframe');
    document.body.appendChild(f);
    f.src = 'data:' + mime_type + ',' + encodeURIComponent(content);

    setTimeout(function() {
      document.body.removeChild(f);
    }, 333);
    $scope.safe_apply();  // Added 12/31/2016 to try to get svg-zarc directive to populate
    return true;
  }
};
/*
$scope.select_xsec = function(ix,event) {
  $scope.sst2.selected_bulkhead = [];
  if (event.ctrlKey) {
    var loc = $scope.sst2.selected_xsec.indexOf(ix);
    if (loc === -1) {
      $scope.sst2.selected_xsec.push(ix);
    } else {
      $scope.sst2.selected_xsec.splice(loc, 1);
    }
    $scope.sst2.selected_xsec = [ix];
  } else if (event.shiftKey) {
    var loc = $scope.sst2.selected_xsec.indexOf(ix);
    if (loc === -1) {
      $scope.sst2.selected_xsec.push(ix);
    }
  } else {
    $scope.sst2.selected_xsec = [ix];
  }
};
*/
$scope.select_xsec = function(ix, event) {
  $scope.select_any(ix, $scope.sst2.selected_xsec, $scope.sst2.selected_bulkhead, event);
}
$scope.select_bulkhead = function(ix, event) {
  $scope.select_any(ix, $scope.sst2.selected_bulkhead, $scope.sst2.selected_xsec, event);
}
$scope.select_any = function(ix, sel_list, other_sel_list, event) {
  while (other_sel_list.length > 0) {
    other_sel_list.pop();
  }
  if (event.ctrlKey) {
    var loc = sel_list.indexOf(ix);
    if (loc === -1) {
      sel_list.push(ix);
    } else {
      sel_list.splice(loc, 1);
    }
    while (sel_list.length > 0) {
      sel_list.pop();
    }
    sel_list.push(ix);
  } else if (event.shiftKey) {   // Shift has weird rules and this is not right
    var loc = sel_list.indexOf(ix);
    if (loc === -1) {
      sel_list.push(ix);
    }
  } else {
    while (sel_list.length > 0) {
      sel_list.pop();
    }
    sel_list.push(ix);
  }
};
$scope.destroy_any = function(mode, type1, type2, sing_noun, plural_noun, selected_index) {
  if (mode === 'all') {
    if ($scope.sst[type1].length == 1) {
      if (window.confirm('Are you sure you want to delete the '+sing_noun+'?')) {
        $scope.sst[type1] = [];
        $scope.sst.top.display[type2] = [];
        $scope.sst.side.display[type2] = [];
        $scope.is_dirty = true;
      }
    } else if ($scope.sst[type1].length > 1) {
      if (window.confirm('Are you sure you want to delete all ' + $scope.sst[type1].length + ' '+plural_noun+'?')) {
        $scope.sst[type1] = [];
        $scope.sst.top.display[type2] = [];
        $scope.sst.side.display[type2] = [];
        $scope.is_dirty = true;
      }
    }
  } else {
    if (selected_index.length === 0) {
      alert ('Need to select a '+sing_noun+' first');
    } else {
      if (selected_index.length === 1) {
        var noun = sing_noun;
      } else {
        var noun = plural_noun;
      }
      if (window.confirm('Are you sure you want to delete the selected '+noun+'?')) {
        for (var i=selected_index.length-1; i>=0; i--) {
          $scope.sst[type1].splice(selected_index[i],1);
          $scope.sst.top.display[type2].splice(selected_index[i],1);
          $scope.sst.side.display[type2].splice(selected_index[i],1);          
        }

        $scope.is_dirty = true;
        if (type2 === 'xsec') {
          $scope.sst2.selected_xsec = [];
        } else if (type2 === 'bulk') {
          $scope.sst2.selected_bulkhead = [];
        }
      }
    }
  }
};
$scope.destroy = function(obj, sing_noun, plural_noun) {
  if (obj.length == 1) {
    if (window.confirm('Are you sure you want to delete the ' + sing_noun)) {
      obj = [];
    }
  } else if (obj.length > 1) {
    if (window.confirm('Are you sure you want to delete all ' + obj.length + ' ' + plural_noun + '?')) {
      obj = [];
    }
  } else {
    alert('Nothing to delete')
  }
};
$scope.is_empty = function(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true && JSON.stringify(obj) === JSON.stringify({});
};

$scope.get_tmx_xsec = function(point_a, point_b, center_y) {
  var angle = Math.atan2(point_b.y - point_a.y, point_b.x - point_a.x);
  var theta = -angle;
  var costh = Math.cos(theta);
  var sinth = Math.sin(theta);
  var tmx = [];
  var h = -point_a.x;
  var k = -(point_a.y + center_y);
  tmx[0] = [costh, -sinth, h*costh - k*sinth];
  tmx[1] = [sinth, costh,  h*sinth + k*costh];
  tmx[2] = [0,     0,      1];

  var inv_tmx = [];
  inv_tmx[0] = [costh,  sinth, -h];
  inv_tmx[1] = [-sinth, costh, -k];
  inv_tmx[2] = [0,      0,     1];
  return {tmx: tmx, inv_tmx: inv_tmx};
}

$scope.get_tmx_horizontal = function(point_a, point_b) {
  var angle = Math.atan2(point_b.y - point_a.y, point_b.x - point_a.x);
  var theta = -angle;
  var costh = Math.cos(theta);
  var sinth = Math.sin(theta);
  var tmx = [];
  var h = -point_a.x;
  var k = -point_a.y;
  tmx[0] = [costh, -sinth, h*costh - k*sinth];
  tmx[1] = [sinth, costh,  h*sinth + k*costh];
  tmx[2] = [0,     0,      1];

  var inv_tmx = [];
  inv_tmx[0] = [costh,  sinth, -h];
  inv_tmx[1] = [-sinth, costh, -k];
  inv_tmx[2] = [0,      0,     1];
  return {tmx: tmx, inv_tmx: inv_tmx};
};

$scope.model_integrity_check = function() {
  var i;
  var j;
  var k;
  var point_list;
  var reverses = 0;
  var mirrors = 0;
  var pt;
  var pt2;
  // xsecs formed properly
  $scope.clean_up_xsecs();
  for (var i=0; i < $scope.sst.xsecs.length; i++) {
    var xsec = $scope.sst.xsecs[i];
    var last = xsec.xsec.length - 1;
    xsec.flood_points = undefined;
    // Check for reversal of xsec coords 
    if (xsec.xsec[0].a.y > xsec.xsec[last].a.y) {
      xsec.xsec.reverse();
      reverses++;
    }
    // check for bacwards (left/right) xsec  T
    var mid = Math.ceil(last/2);
    if (xsec.xsec[mid].a.x < xsec.xsec[0].a.x) {
      var flipx = [
        [-1, 0, 0],
        [0,  1, 0],
        [0,  0, 1]
      ];
      var reX = xsec.xsec[0].a.x;
      for (j=0;j<xsec.xsec.length;j++) {
        point_list = ['a','b','c','d'];
        for (k=0;k<point_list.length;k++) {
          if (xsec.xsec[j][point_list[k]]) {
            var pt = [[xsec.xsec[j][point_list[k]].x], [xsec.xsec[j][point_list[k]].y], [1]]
            var pt2 = math.multiply(flipx, pt);        
            xsec.xsec[j][point_list[k]].x = pt2[0][0] + (reX*2);
            xsec.xsec[j][point_list[k]].y = pt2[1][0];
          }
        }
      }
      mirrors++;
    }
  }
  alert (reverses + " cross sections needed to be inverted.\n" + mirrors + " cross sections needed to be mirrored.\n")
};

$scope.transform = function(pt, tmx) {
  var pt_matrix = [[pt.x],[pt.y],[1]];
  var result_matrix = math.multiply(tmx, pt_matrix);
  return {x:result_matrix[0][0], y:result_matrix[1][0]};
}

$scope.transform_array = function(pts, tmx) {
  var new_pts = [];
  for (var i=0;i<pts.length;i++) {
    new_pts.push($scope.transform(pts[i], tmx));
  }
  return new_pts;
}

$scope.transform_zarc = function(zarc, tmx) {
  var newzarc = [];
  var newlen;
  for (var i=0; i<zarc.length; i++) {
    newlen = newzarc.push({a:$scope.transform(zarc[i].a, tmx)});
    if (zarc[i].d) {
      newzarc[newlen-1].d = $scope.transform(zarc[i].d, tmx);
    }
    if (zarc[i].b) {
      newzarc[newlen-1].b = $scope.transform(zarc[i].b, tmx);
    }
    if (zarc[i].c) {
      newzarc[newlen-1].c = $scope.transform(zarc[i].c, tmx);
    }
    newzarc[newlen-1].is_bezier = zarc[i].is_bezier;
  }
  return newzarc;
}

$scope.orthofix_ref_line = function(obj, obj2) {
  var tmx = ( $scope.get_tmx_horizontal(obj.reference_line.nose, obj.reference_line.tail) ).tmx;  // ignore inv_tmx
  var rot_point_nose = [[obj.reference_line.nose.x],[obj.reference_line.nose.y],[1]];
  var rot_point_tail = [[obj.reference_line.tail.x],[obj.reference_line.tail.y],[1]];
  var rotatd_nose = math.multiply(tmx, rot_point_nose);
  var rotatd_tail = math.multiply(tmx, rot_point_tail);
  obj2 = {
           tmx: tmx,
           reference_line: {
             nose: {
               x: rotatd_nose[0][0],
               y: rotatd_nose[1][0]
             },
             tail: {
               x: rotatd_nose[0][0],
               y: rotatd_nose[1][0]
             }
           }
        };
  return obj2;
};

$scope.is_point_in_view_zone = function(view, point) {
  var zone;
  if (view === 'side') {
    zone = $scope.sst.side.zone;
  } else if (view === 'top') {
    zone = $scope.sst.top.zone;
  }
  if (  // Make sure station point is in one of the side or top zone boxes
     (point.x >= zone.lower_left.x &&
      point.x <= zone.upper_right.x &&
      point.y >= zone.upper_right.y &&
      point.y <= zone.lower_left.y)) {
    return true;
  }
  return false;
}

$scope.clean_up_xsecs = function() {
  $scope.sst.xsec.is_dirty = false;
  $scope.is_dirty = true;
  var i;
  if ($scope.sst.xsecs.length === 0) {
    alert("You don't have any cross sections defined.");
    return;
  }
  for (i=$scope.sst.xsecs.length-1;i>=0;i--) {
    if ($scope.is_empty($scope.sst.xsecs[i].station) || $scope.sst.xsecs[i].xsec.length === 0) {
      $scope.sst.xsecs.splice(i,1);
      i--;
    }
    if ($scope.sst.xsecs[i].xsec.length === 0) {
      $scope.sst.xsecs.splice(i,1);  // Eliminate empty cross section
      i--;
    }
  }
  if (!$scope.sst.side.zone.lower_left && !$scope.sst.side.zone.upper_right) {
    alert("You don't have a side zone box defined (or it's improperly formed). Fix this and run this clean up again and it will be more thorough.");
    return;
  }
  if (!$scope.sst.top.zone.lower_left && !$scope.sst.top.zone.upper_right) {
    alert("You don't have a top zone box defined (or it's improperly formed). Fix this and run this clean up again and it will be more thorough.");
    return;
  }
  /*
  for (i=$scope.sst.xsecs.length-1;i>=0;i--) {
    var is_in_top = $scope.is_point_in_view_zone('top', $scope.sst.xsecs[i].station[0]);
    var is_in_side = $scope.is_point_in_view_zone('side', $scope.sst.xsecs[i].station[0]);
    // Make sure station point is in one of the side or top zone boxes
    if (is_in_top || is_in_side) {
     // It's good!
    } else {
     $scope.sst.xsecs.splice(i,1);
    }
  }
  */
};

$scope.window_width = function(){
   return window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth||0;
};
$scope.window_height = function(){
   return window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight||0;
};

$scope.locate_toolbox = function() {
  var left = $scope.window_width() - $scope.tool_box_width + "px";
  var top = 0 + "px";
  $scope.tool_box.style.left = left;
  $scope.tool_box.style.top = top;
};

$scope.averageify_points = function(pts, range) {
  var n2 = Math.ceil(range/2);
  var nn = n2*2;
  var newpts = [];
  newpts.push(pts[0]);
  for (var i=n2;i<pts.length-n2;i++) {
    var xsum = 0;
    var ysum = 0;
    for (var j=-n2;j<n2;j++) {
      xsum += pts[i+j].x;
      ysum += pts[i+j].y;
    }
    var xavg = xsum / nn;
    var yavg = ysum / nn;
    newpts.push({x:xavg,y:yavg});
  }
  newpts.push(pts[pts.length-1]);
  return newpts;
}

$scope.is_numeric = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
$scope.relief_exterior_controls = function() {
  $scope.sst2.the_set_context = 'relief';
}
$scope.cnc_exterior_controls = function() {
  $scope.sst2.the_set_context = 'cnc';
}
$scope.delete_relief = function() {
  var bs = $scope.sst.bulkheads;
  for (var i=0; i<bs.length; i++) {
    if (bs[i].relief_shapes) {
      delete bs[i].relief_shapes;
    }
  }
}
$scope.normal_path = function(path) {
  for (var i=0;i<path.length; i++) {
    path[i].x = path[i].X;
    path[i].y = path[i].Y;
  }
}
$scope.clippify_path = function(path) {
  for (var i=0;i<path.length; i++) {
    path[i].X = path[i].x;
    path[i].Y = path[i].y;
    delete path[i].x;
    delete path[i].y;
  }
}
$scope.clone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
}
$scope.do_offset_clipper = function() {
  var co = new ClipperLib.ClipperOffset();
  if ($scope.sst2.selected_bulkhead.length === 0) {
    alert("Please first select one or more bulkheads (green).  Hint multiples can be selected by holding shift.");
    return;
  }  
  var bs = $scope.sst.bulkheads;
  var relief_pixels = [];
  relief_pixels[0] = $scope.sst2.relief_width1;
  relief_pixels[1] = $scope.sst2.relief_width2;
  for (var i=0; i<$scope.sst2.selected_bulkhead.length; i++) {
    var index = $scope.sst2.selected_bulkhead[i];
    var b = bs[index];
    var relief_index = -1;
    var relief_shapes = [];
    b.relief_shapes = [];

    if (b.shape[0].hasOwnProperty('x') && !b.shape[0].hasOwnProperty('X')) {
      $scope.clippify_path(b.shape);
    }    
    var subj = new ClipperLib.Paths();
    var solution = new ClipperLib.Paths();
    var co = new ClipperLib.ClipperOffset();  // Makes a buffer around your path
    subj = $scope.clone(b.shape);
    var scale = 1;
    ClipperLib.JS.ScaleUpPath(subj, scale);
    co.AddPath(subj, ClipperLib.JoinType.jtSquare, ClipperLib.EndType.etOpenSquare);  //jtSquare squares off sharp edges.  https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclipperoffsetarctolerance
    var relief_index = 0;
    var new_subj = [];
    for (var j=0; j<relief_pixels.length; j++) {
      if ($scope.is_numeric(relief_pixels[j])) {
        co.Execute(solution, relief_pixels[j]*scale);       
        new_subj[relief_index] = solution[0];
        relief_index++;
      }
    } 
    var c = new ClipperLib.Clipper();
    c.AddPaths(new_subj, ClipperLib.PolyType.ptSubject, true);  //  new_subj is array of array of objects.
    c.AddPath(subj, ClipperLib.PolyType.ptClip, true);          // subj is array of objects
    c.Execute(ClipperLib.ClipType.ctUnion, solution); 
    ClipperLib.JS.ScaleDownPaths(solution, scale); 
    for (j=0;j<solution.length;j++) {
      $scope.normal_path(solution[j]);
      b.relief_shapes[0] = solution[j];  // only want last
      b.relief_shapes[0].push(b.relief_shapes[0][b.relief_shapes.length-1]);  // Close the polygon loop
    }
    b.relief_shapes[0] = new_subj[0];
    for (let ii=0;ii<b.relief_shapes[0].length;ii++) {
      b.relief_shapes[0][ii].x = b.relief_shapes[0][ii].X;
      b.relief_shapes[0][ii].y = b.relief_shapes[0][ii].Y;
    }  
  } 
}
$scope.do_cnc_clipper = function() {
  var co = new ClipperLib.ClipperOffset();
  if ($scope.sst2.selected_bulkhead.length === 0) {
    alert("Please first select one or more bulkheads (green).  Hint multiples can be selected by holding shift.");
    return;
  }  
  var bs = $scope.sst.bulkheads;
  var relief_pixels;
  relief_pixels = $scope.sst2.cnc_thickness;
  for (let i=0; i<$scope.sst2.selected_bulkhead.length; i++) {
    var index = $scope.sst2.selected_bulkhead[i];
    var b = bs[index];
    var relief_index = -1;
    var relief_shapes = [];
    b.relief_shapes = [];

    if (b.shape[0].hasOwnProperty('x') && !b.shape[0].hasOwnProperty('X')) {
      $scope.clippify_path(b.shape);
    }    
    var subj = new ClipperLib.Paths();
    var solution = new ClipperLib.Paths();
    var co = new ClipperLib.ClipperOffset();  // Makes a buffer around your path
    subj = $scope.clone(b.shape);
    var scale = 100;
    ClipperLib.JS.ScaleUpPath(subj, scale);
    co.AddPath(subj, ClipperLib.JoinType.jtSquare, ClipperLib.EndType.etOpenSquare);  //jtSquare squares off sharp edges.  https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclipperoffsetarctolerance
    var relief_index = 0;
    var new_subj = [];
    if ($scope.is_numeric(relief_pixels)) {
      co.Execute(solution, relief_pixels*scale);      
      new_subj[relief_index] = solution[0];
      relief_index++;
    }
    // At this point subj contains the closed bulkhead polygon (the lime green shape) and new_subj contains the offset (the red shape).  Now we intersect the two:
    var c = new ClipperLib.Clipper();
    c.AddPaths(new_subj, ClipperLib.PolyType.ptSubject, true);
    c.AddPath(subj, ClipperLib.PolyType.ptClip, true);
    c.Execute(ClipperLib.ClipType.ctIntersection, solution); 
    ClipperLib.JS.ScaleDownPaths(solution, scale);
    for (let j=0;j<solution.length;j++) {
      $scope.normal_path(solution[0]);
      b.relief_shapes[0] = solution[0];  // only want last
      b.relief_shapes[0].push(b.relief_shapes[0][b.relief_shapes.length-1]);  // Close the polygon loop
    }

    for (let ii=0;ii<b.relief_shapes[0].length;ii++) {
      b.relief_shapes[0][ii].x = b.relief_shapes[0][ii].X;
      b.relief_shapes[0][ii].y = b.relief_shapes[0][ii].Y;
    }   

  } 
}
$scope.do_relief = function() {
  if ($scope.sst2.selected_bulkhead.length === 0) {
    alert("Please first select one or more bulkeads.  Hint multiples can be selected by holding shift.");
    return;
  }  
  var bs = $scope.sst.bulkheads;
  var relief_pixels = [];
  relief_pixels[0] = $scope.sst2.relief_width1;
  relief_pixels[1] = $scope.sst2.relief_width2;
  for (var i=0; i<$scope.sst2.selected_bulkhead.length; i++) {
    var index = $scope.sst2.selected_bulkhead[i];
    var b = bs[index];
    var relief_index = -1;
    var relief_shapes = [];
    b.relief_shapes = [];
    for (var j=0; j<relief_pixels.length; j++) {
      if ($scope.is_numeric(relief_pixels[j])) {
        relief_index++;        
        relief_shapes[relief_index] = [{x:b.shape[0].x, y:b.shape[0].y - -relief_pixels[j]}];
        for (var k=1; k<b.shape.length-1; k++) {
          var theta = Math.atan2(b.shape[k-1].y - b.shape[k].y, b.shape[k-1].x - b.shape[k].x);
          var x1 = Math.cos(theta - (Math.PI / 2.0) )*relief_pixels[j] + b.shape[k].x;
          var y1 = Math.sin(theta - (Math.PI / 2.0) )*relief_pixels[j] + b.shape[k].y;
          var x2 = Math.cos(theta - (Math.PI / 2.0) )*relief_pixels[j] + b.shape[k].x;
          var y2 = Math.sin(theta - (Math.PI / 2.0) )*relief_pixels[j] + b.shape[k].y; 
          var the_x = (x1 + x2) / 2.0;
          var the_y = (y1 + y2) / 2.0;
          relief_shapes[relief_index].push({x:the_x, y:the_y});
        }
        relief_shapes[relief_index].push({x:b.shape[b.shape.length-1].x, y:b.shape[b.shape.length-1].y - relief_pixels[j]});
        b.relief_shapes[relief_index] = $scope.averageify_points(relief_shapes[relief_index],10);
      }
    }
  }
}

$scope.get_scaled_point = function(clientX, clientY, scale) {
  var offset = {};
  var point = {};
  var the_svg = document.getElementById('the-svg-div');
  offset.x=Math.max(document.documentElement.scrollLeft,document.body.scrollLeft)-8
    - the_svg.offsetLeft;
  offset.y=Math.max(document.documentElement.scrollTop,document.body.scrollTop)-8
    - (the_svg.offsetTop + 190);
  point.x = clientX / scale + offset.x / scale;
  point.y = clientY / scale + offset.y / scale;    
  return point;
}

$scope.click_on_image = function(event) {
  // Firefox needs to use getBoundingClientRect().left instead of offsetLeft and offsetTop
  // That is the source of the bugs.  Need to revert to offsetLeft and offsetTop and figure something
  // else for Firefox
  if ($scope.sst2.is_drag) {
    $scope.sst2.is_drag = false;
    return;
  }
  var point = $scope.get_scaled_point(event.clientX, event.clientY, $scope.sst2.scale);
  $scope.theX = point.x;
  $scope.theY = point.y;
  //$scope.theY -= 190;
  $scope.coord_available = true;
};

// In this scheme we have a list of whole arcs, not points.
$scope.insert_arc_node = function(arc_obj, point, is_bezier) {
  var arc_len = arc_obj.length;
  if (arc_len === 0) {
    arc_obj.push({a: point,is_bezier:is_bezier});
  } else if (arc_len >= 1) {
    arc_obj[arc_len - 1].d = point;
    arc_obj[arc_len - 1].is_bezier = is_bezier;  // Redundant but lets user change mind.
    arc_obj.push({a:arc_obj[arc_len - 1].d,is_bezier:is_bezier});  // This makes the new node's a point to the same object as the old node's d
    if (is_bezier) {
      arc_obj[arc_len - 1].b = $scope.lerp(arc_obj[arc_len - 1].a, arc_obj[arc_len - 1].d, 0.33333);
      arc_obj[arc_len - 1].c = $scope.lerp(arc_obj[arc_len - 1].a, arc_obj[arc_len - 1].d, 0.66667);
    }
  }
  arc_obj.is_selected = true;
  arc_obj.selected_element = arc_len - 1;
}

$scope.set_drawing_scale = function(mode) {
  $scope.clear_op('keep_bulkheads');
  if (mode === '+') {
    $scope.sst2.scale += 0.3;
  } else if (mode === '-') {
    $scope.sst2.scale -= 0.3;
  }
  $rootScope.scale = $scope.sst2.scale;
};
$scope.initialize_toolbox = function() {
  $scope.sst2.show_bulkhead_controls = false;
};
$scope.onDragComplete=function(data, evt) {
  console.log("drag success, data:", data);
}
$scope.onDragMove=function(data, evt) {
  console.log("drag excess, data:", data);
}

$scope.sst2.show_select_background = false;
$scope.sst2.bulkhead_placement_xy = {x:-200,y:-50};
$scope.is_dirty = false;
$scope.sst2.show_button = false;
$scope.sst2.scope_id = 1
$scope.m = {};
$scope.sst2.show_background = true;
$scope.set_plan_image("img/p51_side.jpg");
$scope.non_modal_shown = true;
$scope.tool_box = document.getElementById('the-toolbox');
$scope.tool_box_width = 300;
$scope.tool_box_height = 500;
$scope.sst.show_final_bulkheads = false;
$scope.clear_op();
$scope.sst.background_3view = "";
$scope.sst2.generation_mode = 'normal';
$scope.sst2.scale = 1;
$rootScope.scale = $scope.sst2.scale;
$scope.sst2.min_bulkead_height = 125;
$scope.sst2.bulkhead_context_on = false;
$scope.sst2.selected_xsec = [];
$scope.sst2.selected_bulkhead = [];
$scope.sst2.the_set_context = '';
// For test_zarc.html
$scope.test_get_coord_live = true;  
$scope.sst2.test_zarc_obj = [{a:{x:40,y:500}, b:{x:40,y:350}, c:{x:540,y:200}, d:{x:640,y:200}, is_bezier:true}, 
                             {a:{x:640,y:200}, is_bezier:false}];
}])
.controller('MyCtrl2', [function() {

}]);
