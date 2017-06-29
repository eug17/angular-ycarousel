if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports) {
	module.exports = 'ycarousel';
}
(function(angular) {
	'use strict';
	angular.module('ycarousel', [])
		.directive('ycarousel', ['$timeout', function($timeout) {
			return {
				restrict: "EA",
				replace: true,
				scope: {
					afterChange: '=ycarouselAfterChange', // callback function
					ycarouselDataChange: '='
				},
				link: function(scope, element, attrs) {
					var containerMove, stackMove, stackLenght, scrollWidth, startLeft, compare_time, startMoveX, startMoveY, y_move, x_move, length, max_dist;
					var startMove = false;
					var index = 0;
					// default values
					var coeficient = 0.85;
					var y_scroll_sensetivity = 50;
					var x_scroll_sensetivity = 20;
					var allowed_bounce = 50;

					// disable scroll
					element[0].style.overflow = 'hidden';
					element[0].style.position = 'relative';

					var el = element[0].firstElementChild;
					el.style.transform = 'translateX(0px)';

					if (attrs.coeficient) {
						coeficient = parseFloat(attrs.coeficient);
					}
					if (attrs.scrollYSensetivity) {
						y_scroll_sensetivity = parseFloat(attrs.scrollYSensetivity);
					}
					if (attrs.scrollXSensetivity) {
						x_scroll_sensetivity = parseFloat(attrs.scrollXSensetivity);
					}
					if (attrs.allowedBounce) {
						allowed_bounce = parseFloat(attrs.allowedBounce);
					}


					console.log('element', element);
					containerMove = parseFloat(element[0].clientWidth * coeficient);
					$timeout(function() {
						length = element[0].firstElementChild.childElementCount;
						// console.log('length', length);
						scrollWidth = containerMove * length * -1;
						max_dist = scrollWidth + containerMove - allowed_bounce;
					});

					if (attrs.ycarouselDataChange) {
						scope.$watch('ycarouselDataChange', function(newValue, oldValue) {
							if (oldValue != newValue) {
								containerMove = parseFloat(element[0].clientWidth * coeficient);
								el.style.transform = 'translateX(0px)';
								index = 0;
								$timeout(function() {
									length = element[0].firstElementChild.childElementCount;
									// console.log('length', length);
									scrollWidth = containerMove * length * -1;
									max_dist = scrollWidth + containerMove - allowed_bounce;
								});

							}
						})
					}

					element.bind('mousedown', function(e) {
						startMove = true;
						stackMove = [];
						stackLenght = 0;
						startMoveX = e.clientX;
						startMoveY = e.clientY;
						y_move = 0;
						x_move = 0;
						startLeft = parseFloat(el.style.transform.replace(/[^-0-9\.\d]/g, ''));
					});

					element.bind('touchstart', function(e) {
						startMove = true;
						stackMove = [];
						stackLenght = 0;
						startMoveX = e.changedTouches[0].clientX;
						startMoveY = e.changedTouches[0].clientY;
						y_move = 0;
						x_move = 0;
						startLeft = parseFloat(el.style.transform.replace(/[^-0-9\.\d]/g, ''));
						// console.log('startLeft', startLeft);
					});


					element.bind('mousemove', function(e) {
						if (startMove) {
							y_move = Math.abs(startMoveY - e.clientY);
							x_move = Math.abs(startMoveX - e.clientX);
							if (y_move > y_scroll_sensetivity || x_move < x_scroll_sensetivity) {
								return;
							}
							stackLenght = stackMove.push({
								move: e.clientX,
								time: e.timeStamp
							});

							el.style.transitionDuration = '0s';
							var coord = startLeft - (startMoveX - e.clientX);

							if (coord < allowed_bounce && index < length) {
								el.style.transform = 'translateX(' + (startLeft - (startMoveX - e.clientX)) + 'px)';
							}


						}
					});

					element.bind('touchmove', function(e) {
						if (startMove) {

							y_move = Math.abs(startMoveY - e.changedTouches[0].clientY);
							x_move = Math.abs(startMoveX - e.changedTouches[0].clientX);

							if (y_move > y_scroll_sensetivity || x_move < x_scroll_sensetivity) {
								return;
							}
							console
							stackLenght = stackMove.push({
								move: e.changedTouches[0].clientX,
								time: e.timeStamp
							});
							var coord = startLeft - (startMoveX - e.changedTouches[0].clientX);
							el.style.transitionDuration = '0s';
							if (coord < allowed_bounce && index < length) {
								el.style.transform = 'translateX(' + (startLeft - (startMoveX - e.changedTouches[0].clientX)) + 'px)';
							}

						}
					});

					element.bind('mouseup', function(e) {
						if (startMove) {
							el.style.transitionDuration = '0.9s';
							var point = Math.floor(stackLenght * 0.75);
							if (y_move < y_scroll_sensetivity && x_move > x_scroll_sensetivity) {
								compare_time = stackMove[stackLenght - 1].time - stackMove[point].time;
								if (compare_time < 130) {
									el.style.transitionDuration = '0.4s';
								}

								var coord = startLeft - (startMoveX - e.clientX);
								if ((coord < allowed_bounce) && ((coord - containerMove) > scrollWidth)) {
									if ((e.clientX < startMoveX) && ((startLeft - containerMove) >= max_dist)) {

										el.style.transform = 'translateX(' + (startLeft - containerMove) + 'px)';
										index++;
										scope.afterChange({
											'index': index
										});
									} else if (e.clientX > startMoveX) {
										el.style.transform = 'translateX(' + (startLeft + containerMove) + 'px)';
										index--;
										scope.afterChange({
											'index': index
										});
									} else {
										el.style.transform = 'translateX(' + (startLeft) + 'px)';
									}
								} else if (coord > 0) {
									el.style.transform = 'translateX(0px)';
								} else if ((coord + containerMove) < scrollWidth) {
									el.style.transform = 'translateX(' + (startLeft) + 'px)';
								}
							} else {
								el.style.transform = 'translateX(' + (startLeft) + 'px)';
							}
							startMove = false;
						}
					});

					element.bind('touchend', function(e) {
						if (startMove) {
							el.style.transitionDuration = '0.9s';

							var coord = startLeft - (startMoveX - e.changedTouches[0].clientX);
							var point = Math.floor(stackLenght * 0.75);
							if (y_move < y_scroll_sensetivity && x_move > x_scroll_sensetivity) {
								compare_time = stackMove[stackLenght - 1].time - stackMove[point].time;
								if (compare_time < 130) {
									el.style.transitionDuration = '0.4s';
								}

								if ((coord < y_scroll_sensetivity) && ((coord - containerMove) > scrollWidth)) {
									if ((e.changedTouches[0].clientX < startMoveX) && ((startLeft - containerMove) >= max_dist)) {
										el.style.transform = 'translateX(' + (startLeft - containerMove) + 'px)';
										index++;
										scope.afterChange({
											'index': index
										});
									} else if (e.changedTouches[0].clientX > startMoveX) {
										el.style.transform = 'translateX(' + (startLeft + containerMove) + 'px)';
										index--;
										scope.afterChange({
											'index': index
										});
									} else {
										el.style.transform = 'translateX(' + (startLeft) + 'px)';
									}
								} else if (coord > 0) {
									el.style.transform = 'translateX(0px)';
								} else if ((coord + containerMove) > scrollWidth) {
									el.style.transform = 'translateX(' + (startLeft) + 'px)';
								}
							} else {
								el.style.transform = 'translateX(' + (startLeft) + 'px)';
							}

							startMove = false;

						}

					});

					// unbind listeners
					element.on('$destroy', function() {
						element.unbind("mousedown");
						element.unbind("mousemove");
						element.unbind("mouseup");
						element.unbind("touchstart");
						element.unbind("touchmove");
						element.unbind("touchend");
					})
				}
			}
		}]);
})(angular);
