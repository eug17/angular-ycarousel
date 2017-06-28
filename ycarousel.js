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
					// disable scroll
					element[0].style.overflow = 'hidden';
					element[0].style.position = 'relative';

					var el = element[0].firstElementChild;

					containerMove = parseFloat(element[0].clientWidth * coeficient);
					$timeout(function() {
						// scrollWidth = parseFloat(element[0].scrollWidth * -1);
						length = element[0].firstElementChild.childElementCount;
						scrollWidth = containerMove * length * -1;
						max_dist = scrollWidth + containerMove - allowed_bounce;
					});


					el.style.transform = 'translateX(0px)';

					element.bind('mousedown', function(e) {
						startMove = true;
						stackMove = [];
						stackLenght = 0;
						startMoveX = e.clientX;
						startMoveY = e.clientY;
						y_move = 0;
						x_move = 0;
						startLeft = parseFloat(el.style.transform.replace(/[^-0-9\.\d]/g, ''));
						// console.log('startLeft', startLeft);
					});

					element.bind('touchstart', function(e) {
						startMove = true;
						stackMove = [];
						stackLenght = 0;
						startMoveX = e.changedTouches[0].clientX;
						startMoveY = e.changedTouches[0].clientY;
						y_move = 0;
						x_move = 0;
						// containerMove = e.changedTouches[0].clientX;
						startLeft = parseFloat(el.style.transform.replace(/[^-0-9\.\d]/g, ''));
						console.log('startLeft', startLeft);
					});


					element.bind('mousemove', function(e) {
						if (startMove) {
							y_move = Math.abs(startMoveY - e.clientY);
							x_move = Math.abs(startMoveX - e.clientX);
							if (y_move > y_scroll_sensetivity || x_move < x_scroll_sensetivity) {
								e.preventDefault();
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
								e.preventDefault();
							}
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
									if ((stackMove[stackLenght - 1].move < stackMove[point].move) && ((startLeft - containerMove) >= max_dist)) {

										el.style.transform = 'translateX(' + (startLeft - containerMove) + 'px)';
										index++;
										scope.afterChange({
											'index': index
										});
									} else if (stackMove[stackLenght - 1].move > stackMove[point].move) {
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
						// stackMove.length = 0;
						// stackLenght = 0;
					});

					element.bind('touchend', function(e) {
						if (startMove) {
							el.style.transitionDuration = '0.9s';

							var coord = startLeft - (startMoveX - e.changedTouches[0].clientX);
							var point = Math.floor(stackLenght * 0.75);
							// console.log('startLeft', startLeft);
							if (y_move < y_scroll_sensetivity && x_move > x_scroll_sensetivity) {
								// console.log('index', index);
								compare_time = stackMove[stackLenght - 1].time - stackMove[point].time;
								if (compare_time < 130) {
									el.style.transitionDuration = '0.4s';
								}

								if ((coord < y_scroll_sensetivity) && ((coord - containerMove) > scrollWidth)) {
									console.log('stackMove', stackMove);
									if ((stackMove[stackLenght - 1].move < stackMove[point].move) && ((startLeft - containerMove) >= max_dist)) {
										el.style.transform = 'translateX(' + (startLeft - containerMove) + 'px)';
										index++;
										scope.afterChange({
											'index': index
										});
									} else if (stackMove[stackLenght - 1].move > stackMove[point].move) {
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
						// stackMove.length = 0;
						// stackLenght = 0;
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
