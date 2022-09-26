$("select.field-tags, select.field-enum").each(function () {
  $(this).select2();
});

$("div.field-json").each(function () {
  let name = $(this).attr("id");
  new JSONEditor(
    this,
    {
      mode: "tree",
      modes: ["code", "tree"],
      onChangeText: function (json) {
        $(`input[name=${name}]`).val(json);
      },
    },
    JSON.parse($(`input[name=${name}]`).val())
  );
});

$(':input[data-role="file-field-delete"]').each(function () {
  let el = $(this);
  related = $(`#${el.data("for")}`);
  related.on("change", function () {
    if (related.get(0).files.length > 0) {
      el.prop("checked", false);
      el.prop("disabled", true);
    } else {
      el.prop("checked", false);
      el.prop("disabled", false);
    }
  });
});

$("select.field-has-one, select.field-has-many").each(function () {
  let el = $(this);
  el.select2({
    allowClear: true,
    ajax: {
      url: el.data("url"),
      dataType: "json",
      data: function (params) {
        return {
          skip: ((params.page || 1) - 1) * 20,
          limit: 20,
          select2: true,
          where: params.term,
        };
      },
      processResults: function (data, params) {
        return {
          results: $.map(data.items, function (obj) {
            obj.id = obj[el.data("pk")];
            return obj;
          }),
          pagination: {
            more: (params.page || 1) * 20 < data.total,
          },
        };
      },
      cache: true,
    },
    minimumInputLength: 0,
    templateResult: function (item) {
      if (!item.id) return "Search...";
      return $(item._select2_result);
    },
    templateSelection: function (item) {
      if (!item.id) return "Search...";
      if (item._select2_selection) return $(item._select2_selection);
      return $(item.text);
    },
  });
  data = el.data("initial");
  if (data)
    $.ajax({
      url: el.data("url"),
      data: {
        select2: true,
        pks: String(data).split(","),
      },
      traditional: true,
      dataType: "json",
    }).then(function (data) {
      for (obj of data.items) {
        obj.id = obj[el.data("pk")];
        var option = new Option(obj._select2_selection, obj.id, true, true);
        el.append(option).trigger("change");
        el.trigger({
          type: "select2:select",
          params: {
            data: obj,
          },
        });
      }
    });
});
$("input.field-datetime").each(function () {
  let el = $(this);
  el.flatpickr({
    enableTime: true,
    allowInput: true,
    enableSeconds: true,
    time_24hr: true,
    altInput: true,
    dateFormat: "Y-m-d H:i:S",
    altFormat: el.data("alt-format"),
  });
});

$("input.field-date").each(function () {
  let el = $(this);
  el.flatpickr({
    enableTime: false,
    allowInput: true,
    altInput: true,
    dateFormat: "Y-m-d",
    altFormat: el.data("alt-format"),
  });
});

$("input.field-time").each(function () {
  let el = $(this);
  el.flatpickr({
    noCalendar: true,
    enableTime: true,
    allowInput: true,
    enableSeconds: true,
    time_24hr: true,
    altInput: true,
    dateFormat: "H:i:S",
    altFormat: el.data("alt-format"),
  });
});

$(".field-list-btn-add").each(function () {
  var el = $(this);
  el.on("click", function () {
    var field = el.parent();
    var baseName = field.attr("id");
    var idx = field.children(`input[name=${baseName}-next-idx]`).val();
    var template = $(field.children(".template").text());
    $("[name]", template).each(function () {
      var me = $(this);
      prefix = baseName + "." + idx;

      var id = me.attr("id");
      var name = me.attr("name");

      id = prefix + (id !== "" ? "." + id : "");
      name = prefix + (name !== "" ? "." + name : "");

      me.attr("id", id);
      me.attr("name", name);
    });
    template.find("button.field-list-btn-remove").on("click", function () {
      template.remove();
    });
    template.appendTo(field.children(".list-container"));
    field.children(`input[name=${baseName}-next-idx]`).val(parseInt(idx) + 1);
  });
});

