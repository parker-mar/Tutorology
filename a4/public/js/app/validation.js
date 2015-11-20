/**
 * Created by ahmedel-baz on 15-11-07.
 */
angular.module('confirmPassValidation', [])

// Creates a directive to implement
.directive('validPasswordC', function () {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            ctrl.$parsers.unshift(function (viewValue) {
                var noMatch = viewValue != scope.form[attrs['validPasswordC']].$viewValue;
                ctrl.$setValidity('noMatch', !noMatch);
                return viewValue;
            })
        }
    }
});