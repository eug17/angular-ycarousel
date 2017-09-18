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
					atEnd: '=ycarouselAtEnd', // callback function
					ycarouselDataChange: '='
				},
				link: function(scope, element, attrs) {
					var containerMove, stackMove, stackLenght, scrollWidth, startLeft, compare_time, startMoveX, startMoveY, y_move, x_move, length, max_dist, watcher;
					var startMove = false;
					var preventX = false;
					var prevented = false;
					var index = 0;
					// default values
					var coeficient = 0.85;
					var y_scroll_sensetivity = 10;
					var x_scroll_sensetivity = 10;
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
						watcher = scope.$watch('ycarouselDataChange', function(newValue, oldValue) {
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

						// console.log('watcher', watcher);
					}

					element.bind('mousedown', function(e) {
						startMove = true;
						preventX = false;
						prevented = false;
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
						preventX = false;
						prevented = false;
						stackMove = [];
						stackLenght = 0;
						startMoveX = e.changedTouches[0].clientX;
						startMoveY = e.changedTouches[0].clientY;
						y_move = 0;
						x_move = 0;
						startLeft = parseFloat(el.style.transform.replace(/[^-0-9\.\d]/g, ''));
					});


					element.bind('mousemove', function(e) {
						if (startMove) {
							y_move = Math.abs(startMoveY - e.clientY);
							x_move = Math.abs(startMoveX - e.clientX);

							// handle moved click event (M. case)
							if (x_move < x_scroll_sensetivity) {
								return;
							}

							if ((y_move > x_move && !preventX) || (stackLenght && preventX)) {
								// console.log('here');
								stackLenght = 0;
								stackMove.length = 0;
								return;
							} else {
								preventX = true;
								// console.log('there');
								// console.log('e.returnValue', e.returnValue);
								if (e.preventDefault) {
									// console.log('there 2');
									preventX = false;
									e.preventDefault();
									e.stopImmediatePropagation();
									e.returnValue = false;
								}
							}

							stackLenght = stackMove.push({
								moveX: e.clientX,
								moveY: e.clientY,
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

							// handle moved click event (M. case)
							if (x_move < x_scroll_sensetivity) {
								return;
							}

							if ((y_move > x_move && !preventX) || (stackLenght && preventX)) {
								// console.log('here');
								stackLenght = 0;
								stackMove.length = 0;
								return;
							} else {
								preventX = true;
								// console.log('there');
								// console.log('e.returnValue', e.returnValue);
								if (e.preventDefault) {
									// console.log('there 2');
									preventX = false;
									e.preventDefault();
									e.stopImmediatePropagation();
									e.returnValue = false;
								}
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
							// el.style.pointerEvents = 'auto';
							el.style.transitionDuration = '0.9s';
							var point = Math.floor(stackLenght * 0.75);
							if (stackLenght && x_move > x_scroll_sensetivity) {
								if (point > 2) {
									compare_time = stackMove[stackLenght - 1].time - stackMove[point].time;
									if (compare_time < 130) {
										el.style.transitionDuration = '0.4s';
									}
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
								$('.panel-items').css({
									'overflow-y': 'hidden'
								});
							} else {
								el.style.transform = 'translateX(' + (startLeft) + 'px)';
							}
							startMove = false;
							$('.panel-items').css({
								'overflow-y': 'auto'
							});
						}
					});

					element.bind('touchend', function(e) {
						if (startMove && !preventX) {
							// el.style.pointerEvents = 'auto';
							el.style.transitionDuration = '0.9s';

							var coord = startLeft - (startMoveX - e.changedTouches[0].clientX);
							var point = Math.floor(stackLenght * 0.75);
							if (stackLenght && x_move > x_scroll_sensetivity) {
								if (point > 2) {
									compare_time = stackMove[stackLenght - 1].time - stackMove[point].time;
									if (compare_time < 130) {
										el.style.transitionDuration = '0.4s';
									}
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
									if(scope.atEnd)
										scope.atEnd();
								}
							} else {
								el.style.transform = 'translateX(' + (startLeft) + 'px)';
							}
							startMove = false;

						}

					});

					// unbind listeners
					element.on('$destroy', function() {
						if (typeof watcher == 'function') {
							watcher();
						}
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
