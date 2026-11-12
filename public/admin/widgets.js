// Date and time fields for the CMS. They use the browser's own pickers (the same ones as on a phone), and store plain
// text: "2026-12-05" and "19:30". The site reads them as Eastern time, so it never depends on the editor's time zone.
(function () {
  var h = window.h;
  function native(type, extra) {
    return function (props) {
      return h('input', Object.assign({
        type: type,
        id: props.forID,
        className: props.classNameWrapper,
        value: typeof props.value === 'string' ? props.value : '',
        onChange: function (e) { props.onChange(e.target.value); },
        style: { maxWidth: '16rem' },
      }, extra));
    };
  }
  CMS.registerWidget('eventdate', native('date'));
  CMS.registerWidget('eventtime', native('time', { step: 900 }));
})();
