The label/hint/error wrapper used by Input, Textarea and Select; reach for it directly only when wrapping a custom control.

    <Field label="领域" hint="决定这篇讲义属于哪个岛群">
      <MyCustomControl />
    </Field>

Label is 11px uppercase tracked sans; hint is 13px sans in --text-faint; error replaces the hint and turns coral.
