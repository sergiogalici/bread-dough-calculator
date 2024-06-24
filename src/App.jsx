import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import i18n from "./i18n"
import {
  Layout,
  Form,
  InputNumber,
  Select,
  Button,
  Typography,
  Space,
  Modal,
  Alert,
  Radio,
  Checkbox,
  Drawer,
  Slider,
} from "antd"
import { PlusOutlined, DeleteOutlined, MenuOutlined } from "@ant-design/icons"
import "./App.css"
import { calculateDough } from "./utils/calculateBread"
import { calculatePizza } from "./utils/calculatePizza"
import { calculateFocaccia } from "./utils/calculateFocaccia"
import { calculateNaan } from "./utils/calculateNaan"
import { calculateBrioche } from "./utils/calculateBrioche"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const { Header, Content, Footer } = Layout
const { Title } = Typography
const { Option } = Select

const celsiusToFahrenheit = (celsius) => {
  return (celsius * 9) / 5 + 32
}

const fahrenheitToCelsius = (fahrenheit) => {
  return ((fahrenheit - 32) * 5) / 9
}

const prepareChartData = (results, doughType) => {
  const parseAmount = (value) => {
    if (typeof value === "string" && value.includes("-")) {
      return parseFloat(value.split("-")[1].trim())
    }
    return parseFloat(value)
  }

  const data = [
    { name: "Flour", amount: parseAmount(results.totalFlourAmount) },
    { name: "Salt", amount: parseAmount(results.totalSalt) },
    { name: "Yeast", amount: parseAmount(results.totalYeast) },
  ]

  if (doughType === "naan") {
    data.push(
      { name: "Liquid", amount: parseAmount(results.totalLiquid) },
      { name: "Oil", amount: parseAmount(results.oilToAdd) },
      { name: "Yogurt", amount: parseAmount(results.yogurtAmount) }
    )
  } else if (doughType === "brioche") {
    data.push(
      { name: "Milk", amount: parseAmount(results.totalMilk) },
      { name: "Fat", amount: parseAmount(results.totalFat) },
      { name: "Sugar", amount: parseAmount(results.totalSugar) },
      { name: "Eggs", amount: parseAmount(results.totalEggs) }
    )
  } else {
    data.push({ name: "Water", amount: parseAmount(results.totalWater) })
  }

  return data.filter((item) => !isNaN(item.amount) && item.amount > 0)
}

const LanguageSelector = ({
  changeLanguage,
  setDrawerVisible,
  drawerVisible,
}) => {
  const { t } = useTranslation()

  return (
    <>
      <div className="desktop-lang-buttons">
        <Button
          onClick={() => changeLanguage("en")}
          style={{ marginRight: "10px" }}
        >
          🇬🇧
        </Button>
        <Button
          onClick={() => changeLanguage("fr")}
          style={{ marginRight: "10px" }}
        >
          🇫🇷
        </Button>
        <Button
          onClick={() => changeLanguage("es")}
          style={{ marginRight: "10px" }}
        >
          🇪🇸
        </Button>
        <Button
          onClick={() => changeLanguage("it")}
          style={{ marginRight: "10px" }}
        >
          🇮🇹
        </Button>
        <Button
          onClick={() => changeLanguage("pt")}
          style={{ marginRight: "10px" }}
        >
          🇧🇷
        </Button>
        <Button
          onClick={() => changeLanguage("de")}
          style={{ marginRight: "10px" }}
        >
          🇩🇪
        </Button>
      </div>
      <div className="mobile-lang-buttons">
        <Button
          type="primary"
          icon={<MenuOutlined />}
          onClick={() => setDrawerVisible(true)}
          style={{ marginRight: "20px" }}
        />
        <Drawer
          title={t("Select Language")}
          placement="right"
          onClose={() => setDrawerVisible(false)}
          visible={drawerVisible}
        >
          <Button
            onClick={() => changeLanguage("en")}
            style={{ marginBottom: "10px", width: "100%" }}
          >
            🇬🇧 English
          </Button>
          <Button
            onClick={() => changeLanguage("fr")}
            style={{ marginBottom: "10px", width: "100%" }}
          >
            🇫🇷 Français
          </Button>
          <Button
            onClick={() => changeLanguage("es")}
            style={{ marginBottom: "10px", width: "100%" }}
          >
            🇪🇸 Español
          </Button>
          <Button
            onClick={() => changeLanguage("it")}
            style={{ marginBottom: "10px", width: "100%" }}
          >
            🇮🇹 Italiano
          </Button>
          <Button
            onClick={() => changeLanguage("pt")}
            style={{ marginBottom: "10px", width: "100%" }}
          >
            🇧🇷 Português
          </Button>
          <Button
            onClick={() => changeLanguage("de")}
            style={{ marginBottom: "10px", width: "100%" }}
          >
            🇩🇪 Deutsch
          </Button>
        </Drawer>
      </div>
    </>
  )
}

const DoughTypeSelector = ({ doughType, handleDoughTypeChange }) => {
  const { t } = useTranslation()
  return (
    <Radio.Group
      onChange={(e) => handleDoughTypeChange(e.target.value)}
      value={doughType}
      className="radio-group"
      style={{ marginBottom: 20, marginTop: 20 }}
    >
      <Radio.Button value="sourdough">{t("Sourdough Bread")}</Radio.Button>
      <Radio.Button value="pizza">{t("Pizza")}</Radio.Button>
      <Radio.Button value="focaccia">{t("Focaccia")}</Radio.Button>
      <Radio.Button value="brioche">{t("Brioche Buns")}</Radio.Button>
      <Radio.Button value="naan">{t("Naan")}</Radio.Button>
    </Radio.Group>
  )
}

const FlourForm = ({ form, t }) => (
  <Form.List name="flours">
    {(fields, { add, remove }) => (
      <>
        {fields.map((field, index) => (
          <div key={field.key} className="flour-box">
            <Space
              align="baseline"
              style={{ display: "flex", marginBottom: 8 }}
            >
              <Form.Item
                {...field}
                name={[field.name, "flourKind"]}
                fieldKey={[field.fieldKey, "flourKind"]}
                label={t("Type of flour")}
                rules={[
                  { required: true, message: t("Choose your flour type") },
                ]}
              >
                <Select
                  style={{ width: 200 }}
                  placeholder={t("Choose flour type")}
                  onChange={() => {
                    const currentFlours = form.getFieldValue("flours")
                    const updatedFlours = [...currentFlours]
                    updatedFlours[index].proteinContent = undefined
                    form.setFieldsValue({ flours: updatedFlours })
                  }}
                >
                  <Option value="grano duro">{t("Durum Wheat")}</Option>
                  <Option value="grano tenero">{t("Soft Wheat")}</Option>
                  <Option value="farina di segale">{t("Rye Flour")}</Option>
                  <Option value="farina di farro">{t("Spelt Flour")}</Option>
                  <Option value="farina di mais">{t("Cornmeal")}</Option>
                  <Option value="farina di riso">{t("Rice Flour")}</Option>
                </Select>
              </Form.Item>
              <Form.Item
                {...field}
                name={[field.name, "proteinContent"]}
                fieldKey={[field.fieldKey, "proteinContent"]}
                label={t("Protein Content")}
                style={{ width: 200 }}
                rules={[
                  {
                    required:
                      form.getFieldValue(["flours", index, "flourKind"]) !==
                        "farina di mais" &&
                      form.getFieldValue(["flours", index, "flourKind"]) !==
                        "farina di riso",
                    message: t("Insert your flour's protein content"),
                  },
                ]}
              >
                <InputNumber
                  datatype="number"
                  min={0}
                  max={100}
                  placeholder={t("Insert protein content")}
                  style={{ width: "100%" }}
                  addonAfter="%"
                  disabled={
                    form.getFieldValue(["flours", index, "flourKind"]) ===
                      "farina di mais" ||
                    form.getFieldValue(["flours", index, "flourKind"]) ===
                      "farina di riso"
                  }
                />
              </Form.Item>
              <Form.Item
                {...field}
                name={[field.name, "fiberContent"]}
                fieldKey={[field.fieldKey, "fiberContent"]}
                label={t("Fiber Content")}
                style={{ width: 200 }}
                rules={[
                  {
                    required: true,
                    message: t("Insert your flour fiber content"),
                  },
                ]}
              >
                <InputNumber
                  datatype="number"
                  min={0}
                  max={100}
                  placeholder={t("Insert fiber content")}
                  style={{ width: "100%" }}
                  addonAfter="%"
                />
              </Form.Item>
              <Form.Item
                {...field}
                name={[field.name, "flourAmount"]}
                fieldKey={[field.fieldKey, "flourAmount"]}
                label={t("Flour amount")}
                style={{ width: 200 }}
                rules={[
                  {
                    required: true,
                    message: t("Insert your flour amount in grams"),
                  },
                ]}
              >
                <InputNumber
                  datatype="number"
                  min={0}
                  placeholder={t("Insert flour amount in grams")}
                  style={{ width: "100%" }}
                  addonAfter="g"
                />
              </Form.Item>
              {fields.length > 1 && (
                <DeleteOutlined onClick={() => remove(field.name)} />
              )}
            </Space>
          </div>
        ))}
        <Form.Item>
          <Button
            type="dashed"
            onClick={() => add()}
            block
            icon={<PlusOutlined />}
          >
            {t("Add another flour to the mix")}
          </Button>
        </Form.Item>
      </>
    )}
  </Form.List>
)

const FocacciaForm = ({ t }) => (
  <div className="flour-box">
    <Space
      align="baseline"
      style={{ display: "flex", marginBottom: 8, width: "100%" }}
    >
      <Form.Item
        name="proteinContent"
        label={t("Protein Content")}
        style={{ width: 200 }}
        rules={[
          { required: true, message: t("Insert your flour's protein content") },
        ]}
      >
        <InputNumber
          datatype="number"
          min={0}
          max={100}
          placeholder={t("Insert protein content")}
          style={{ width: "100%" }}
          addonAfter="%"
        />
      </Form.Item>
      <Form.Item
        name="fiberContent"
        label={t("Fiber Content")}
        style={{ width: 200 }}
        rules={[
          { required: true, message: t("Insert your flour fiber content") },
        ]}
      >
        <InputNumber
          datatype="number"
          min={0}
          max={100}
          placeholder={t("Insert fiber content")}
          style={{ width: "100%" }}
          addonAfter="%"
        />
      </Form.Item>
      <Form.Item
        name="flourAmount"
        label={t("Flour Amount")}
        style={{ width: 200 }}
        rules={[
          { required: true, message: t("Insert your flour amount in grams") },
        ]}
      >
        <InputNumber
          datatype="number"
          min={0}
          placeholder={t("Insert flour amount in grams")}
          style={{ width: "100%" }}
          addonAfter="g"
        />
      </Form.Item>
    </Space>
  </div>
)

const BriocheForm = ({ t }) => (
  <div className="flour-box">
    <Space direction="vertical" style={{ width: "100%" }}>
      <Form.Item
        name="briocheWeight"
        label={t("Desired weight of each bun (g)")}
        initialValue={80}
        rules={[
          { required: true, message: t("Please input weight of each bun") },
        ]}
      >
        <InputNumber
          datatype="number"
          addonAfter="g"
          min={0}
          style={{ width: "100%" }}
        />
      </Form.Item>
      <Form.Item
        name="bunCount"
        label={t("Number of buns")}
        rules={[{ required: true, message: t("Please input number of buns") }]}
      >
        <InputNumber datatype="number" min={0} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        name="hydrationPercentage"
        label={t("Hydration percentage")}
        initialValue={65}
        rules={[
          { required: true, message: t("Please input hydration percentage") },
        ]}
      >
        <InputNumber
          datatype="number"
          min={0}
          max={100}
          style={{ width: "100%" }}
          addonAfter="%"
        />
      </Form.Item>
      <Form.Item
        name="fatPercentage"
        label={t("Fat percentage")}
        initialValue={20}
        rules={[{ required: true, message: t("Please input fat percentage") }]}
      >
        <InputNumber
          datatype="number"
          min={0}
          max={100}
          style={{ width: "100%" }}
          addonAfter="%"
        />
      </Form.Item>
      <Form.Item
        name="fatType"
        label={t("Fat type")}
        rules={[{ required: true, message: t("Please select fat type") }]}
      >
        <Select style={{ width: 200 }}>
          <Option value={t("Butter")}>{t("Butter")}</Option>
          <Option value={t("Oil")}>{t("Oil")}</Option>
          <Option value={t("Margarine")}>{t("Margarine")}</Option>
          <Option value={t("Lard")}>{t("Lard")}</Option>
        </Select>
      </Form.Item>
      <Form.Item name="includeEggs" valuePropName="checked">
        <Checkbox>{t("Include eggs")}</Checkbox>
      </Form.Item>
      <Form.Item
        name="milkType"
        label={t("Milk type")}
        rules={[{ required: true, message: t("Please select milk type") }]}
      >
        <Select style={{ width: 200 }}>
          <Option value={t("Whole Milk")}>{t("Whole Milk")}</Option>
          <Option value={t("Skim Milk")}>{t("Skim Milk")}</Option>
          <Option value={t("Almond Milk")}>{t("Almond Milk")}</Option>
          <Option value={t("Soy Milk")}>{t("Soy Milk")}</Option>
          <Option value={t("Oat Milk")}>{t("Oat Milk")}</Option>
        </Select>
      </Form.Item>
    </Space>
  </div>
)

const NaanForm = ({ t }) => (
  <div className="flour-box">
    <Space direction="vertical" style={{ width: "100%" }}>
      <Form.Item
        name="naanCount"
        label={t("Number of Naans")}
        rules={[{ required: true, message: t("Please input number of naans") }]}
      >
        <InputNumber datatype="number" min={0} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        name="hydrationPercentage"
        label={t("Hydration percentage")}
        initialValue={60}
        rules={[
          { required: true, message: t("Please input hydration percentage") },
        ]}
      >
        <InputNumber
          datatype="number"
          min={0}
          max={100}
          style={{ width: "100%" }}
          addonAfter="%"
        />
      </Form.Item>
      <Form.Item
        name="fatPercentage"
        label={t("Fat percentage")}
        initialValue={20}
        rules={[{ required: true, message: t("Please input fat percentage") }]}
      >
        <InputNumber
          datatype="number"
          min={0}
          max={100}
          style={{ width: "100%" }}
          addonAfter="%"
        />
      </Form.Item>
      <Form.Item
        name="yogurtType"
        label={t("Yogurt Type")}
        style={{ width: 200 }}
      >
        <Select style={{ width: 200 }}>
          <Option value={t("No Yogurt")}>{t("No Yogurt")}</Option>
          <Option value={t("Full Fat Yogurt")}>{t("Full Fat Yogurt")}</Option>
          <Option value={t("Low Fat Yogurt")}>{t("Low Fat Yogurt")}</Option>
          <Option value={t("Non Fat Yogurt")}>{t("Non Fat Yogurt")}</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="liquidType"
        label={t("Liquid Type")}
        style={{ width: 200 }}
      >
        <Select style={{ width: 200 }}>
          <Option value={t("Water")}>{t("Water")}</Option>
          <Option value={t("Whole Milk")}>{t("Whole Milk")}</Option>
          <Option value={t("Skim Milk")}>{t("Skim Milk")}</Option>
          <Option value={t("Almond Milk")}>{t("Almond Milk")}</Option>
          <Option value={t("Soy Milk")}>{t("Soy Milk")}</Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="naanWeight"
        label={t("Desired weight of each naan (g)")}
        initialValue={100}
      >
        <InputNumber
          datatype="number"
          addonAfter="g"
          min={0}
          style={{ width: "100%" }}
        />
      </Form.Item>
    </Space>
  </div>
)

const PizzaForm = ({ form, t }) => {
  const [flourCount, setFlourCount] = useState(1)
  const flours = Form.useWatch("flours", form) || []

  const updateAllFlourPercentages = (newFlours) => {
    const equalPercentage = 100 / newFlours.length
    const updatedFlours = newFlours.map((flour) => ({
      ...flour,
      flourPercentage: equalPercentage,
    }))
    form.setFieldsValue({ flours: updatedFlours })
  }

  useEffect(() => {
    if (flours.length === 0) {
      form.setFieldsValue({
        flours: [
          {
            flourPercentage: 100,
          },
        ],
      })
      setFlourCount(1)
    } else if (flours.length !== flourCount) {
      updateAllFlourPercentages(flours)
      setFlourCount(flours.length)
    }
  }, [flours.length, form, flourCount])

  const updatePercentages = (index, newValue) => {
    const currentFlours = form.getFieldValue("flours") || []
    if (currentFlours.length === 0) return

    let totalOthers = currentFlours.reduce(
      (sum, flour, i) =>
        i !== index ? sum + (flour?.flourPercentage || 0) : sum,
      0
    )

    if (totalOthers === 0) {
      const remainingPercentage = 100 - newValue
      const otherFlourCount = currentFlours.length - 1
      const equalShare = remainingPercentage / otherFlourCount

      const updatedFlours = currentFlours.map((flour, i) => {
        if (i === index) {
          return { ...flour, flourPercentage: newValue }
        } else {
          return { ...flour, flourPercentage: equalShare }
        }
      })

      form.setFieldsValue({ flours: updatedFlours })
    } else {
      const remaining = 100 - newValue
      const factor = remaining / totalOthers

      const updatedFlours = currentFlours.map((flour, i) => {
        if (i === index) {
          return { ...flour, flourPercentage: newValue }
        } else {
          const currentPercentage = flour?.flourPercentage || 0
          return {
            ...flour,
            flourPercentage: Math.round(currentPercentage * factor * 10) / 10,
          }
        }
      })

      form.setFieldsValue({ flours: updatedFlours })
    }
  }

  const isGlutenFree = (flourKind) =>
    flourKind === "farina di mais" || flourKind === "farina di riso"

  return (
    <>
      <Form.Item
        name="numberOfPizzas"
        label={t("Number of pizzas")}
        rules={[
          { required: true, message: t("Please input number of pizzas") },
        ]}
      >
        <InputNumber datatype="number" min={1} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        name="weightPerPizza"
        label={t("Weight per pizza (g)")}
        initialValue={250}
        rules={[
          { required: true, message: t("Please input weight per pizza") },
        ]}
      >
        <InputNumber
          datatype="number"
          min={100}
          max={500}
          style={{ width: "100%" }}
          addonAfter="g"
        />
      </Form.Item>
      <Form.List
        name="flours"
        rules={[
          {
            validator: async (_, flours) => {
              if (!flours || flours.length < 1) {
                return Promise.reject(
                  new Error(t("At least one type of flour is required"))
                )
              }
              const totalPercentage = flours.reduce(
                (sum, flour) => sum + (flour?.flourPercentage || 0),
                0
              )
              if (Math.abs(totalPercentage - 100) > 0.1) {
                return Promise.reject(
                  new Error(t("Total flour percentage must be 100%"))
                )
              }
            },
          },
        ]}
      >
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <div key={field.key} className="flour-box">
                <Space
                  align="baseline"
                  style={{ display: "flex", marginBottom: 8 }}
                >
                  <Form.Item
                    {...field}
                    name={[field.name, "flourKind"]}
                    fieldKey={[field.fieldKey, "flourKind"]}
                    label={t("Type of flour")}
                    rules={[
                      { required: true, message: t("Choose your flour type") },
                    ]}
                  >
                    <Select
                      style={{ width: 200 }}
                      placeholder={t("Choose flour type")}
                      onChange={() => {
                        const currentFlours = form.getFieldValue("flours")
                        const updatedFlours = [...currentFlours]
                        updatedFlours[index].proteinContent = undefined
                        form.setFieldsValue({ flours: updatedFlours })
                      }}
                    >
                      <Option value="grano duro">{t("Durum Wheat")}</Option>
                      <Option value="grano tenero">{t("Soft Wheat")}</Option>
                      <Option value="farina di farro">
                        {t("Spelt Flour")}
                      </Option>
                      <Option value="farina di mais">{t("Cornmeal")}</Option>
                      <Option value="farina di riso">{t("Rice Flour")}</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, "flourPercentage"]}
                    fieldKey={[field.fieldKey, "flourPercentage"]}
                    label={t("Flour percentage")}
                  >
                    <Slider
                      min={0}
                      max={100}
                      onChange={(value) => updatePercentages(index, value)}
                      style={{ width: 200 }}
                    />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, "proteinContent"]}
                    fieldKey={[field.fieldKey, "proteinContent"]}
                    label={t("Protein Content")}
                    rules={[
                      {
                        required: !isGlutenFree(
                          form.getFieldValue(["flours", index, "flourKind"])
                        ),
                        message: t("Insert your flour's protein content"),
                      },
                    ]}
                  >
                    <InputNumber
                      datatype="number"
                      min={0}
                      max={100}
                      placeholder={t("Insert protein content")}
                      style={{ width: 200 }}
                      addonAfter="%"
                      disabled={isGlutenFree(
                        form.getFieldValue(["flours", index, "flourKind"])
                      )}
                    />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, "fiberContent"]}
                    fieldKey={[field.fieldKey, "fiberContent"]}
                    label={t("Fiber Content")}
                    rules={[
                      {
                        required: true,
                        message: t("Insert your flour fiber content"),
                      },
                    ]}
                  >
                    <InputNumber
                      datatype="number"
                      min={0}
                      max={100}
                      placeholder={t("Insert fiber content")}
                      style={{ width: 200 }}
                      addonAfter="%"
                    />
                  </Form.Item>
                  {fields.length > 1 && (
                    <DeleteOutlined
                      onClick={() => {
                        remove(field.name)
                        const newFlours = form
                          .getFieldValue("flours")
                          .filter((_, i) => i !== index)
                        updateAllFlourPercentages(newFlours)
                      }}
                    />
                  )}
                </Space>
              </div>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => {
                  add()
                  const newFlours = [...form.getFieldValue("flours")]
                  updateAllFlourPercentages(newFlours)
                }}
                block
                icon={<PlusOutlined />}
              >
                {t("Add another flour to the mix")}
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </>
  )
}

const ResultsModal = ({
  modalVisible,
  handleModalOk,
  handleModalCancel,
  results,
  doughType,
  t,
}) => {
  const chartData = results ? prepareChartData(results, doughType) : []

  return (
    <Modal
      title={t("Results")}
      open={modalVisible}
      onOk={handleModalOk}
      onCancel={handleModalCancel}
      style={{ gap: 20 }}
      okText={t("New mix")}
      cancelText={t("Back to your mix")}
    >
      {results && results.totalFlourAmount > 0 ? (
        <div className="results-box">
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <Alert
            message={`${t("Total flour")}: ${results.totalFlourAmount} g`}
            type="info"
            showIcon
          />
          {doughType === "brioche" ? (
            <>
              <Alert
                message={`${t("Milk")} (${t(results.milkType)}): ${
                  results.totalMilk
                } g`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Fat")} (${t(results.fatType)}): ${
                  results.totalFat
                } g`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Sugar")}: ${results.totalSugar} g`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Yeast")}: ${results.totalYeast} g`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Proofing time")}: ${results.proofingTime}`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Eggs")}: ${results.eggsCount} (${
                  results.totalEggs
                }g)`}
                type="info"
                showIcon
              />
              {results.numberOfBrioche && (
                <Alert
                  message={`${t("Number of brioches")} (${
                    results.briocheWeight
                  }g): ${results.numberOfBrioche}`}
                  type="info"
                  showIcon
                />
              )}
            </>
          ) : doughType === "naan" ? (
            <>
              <Alert
                message={`${t("Salt")}: ${results.totalSalt} g`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Yeast")}: ${results.totalYeast} g`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Yogurt")} (${t(results.yogurtType)}): ${
                  results.yogurtAmount
                } g`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Liquid")} (${t(results.liquidType)}): ${
                  results.totalLiquid
                } g`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Oil")}: ${results.oilToAdd} g`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Proofing time")}: ${results.proofingTime}`}
                type="info"
                showIcon
              />
              {results.numberOfNaan && (
                <Alert
                  message={`${t("Number of naans")} (${results.naanWeight}g): ${
                    results.numberOfNaan
                  }`}
                  type="info"
                  showIcon
                />
              )}
            </>
          ) : (
            <>
              {doughType === "pizza" &&
                results.flourComposition.map((flour, index) => (
                  <Alert
                    key={index}
                    message={`${t(flour.name)}: ${flour.amount} g`}
                    type="info"
                    showIcon
                  />
                ))}
              <Alert
                message={`${t("W rating")}: ${results.wRating}`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Water")}: ${results.totalWater} g`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Hydration percentage")}: ${
                  results.hydrationPercentage
                }%`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Salt")}: ${results.totalSalt} g`}
                type="info"
                showIcon
              />
              <Alert
                message={`${
                  doughType === "sourdough"
                    ? t("Sourdough starter")
                    : t("Yeast")
                }: ${results.totalYeast} g`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Proofing time")}: ${results.riseTime}`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Fiber content")}: ${results.fiberRatio} %`}
                type="info"
                showIcon
              />
            </>
          )}
        </div>
      ) : (
        <Alert message={t("Invalid Input")} type="error" />
      )}
    </Modal>
  )
}

const ScaleRecipe = ({ form, t, doughType }) => {
  const scaleRecipe = () => {
    const targetFlourWeight = form.getFieldValue("targetFlourWeight")
    if (!targetFlourWeight) return

    const currentValues = form.getFieldsValue()
    let currentTotalFlour = 0

    if (doughType === "focaccia") {
      currentTotalFlour = currentValues.flourAmount
    } else {
      currentTotalFlour = currentValues.flours.reduce(
        (sum, flour) => sum + flour.flourAmount,
        0
      )
    }

    const scaleFactor = targetFlourWeight / currentTotalFlour

    if (doughType === "focaccia") {
      form.setFieldsValue({
        flourAmount: Math.round(currentValues.flourAmount * scaleFactor),
      })
    } else {
      const scaledFlours = currentValues.flours.map((flour) => ({
        ...flour,
        flourAmount: Math.round(flour.flourAmount * scaleFactor),
      }))
      form.setFieldsValue({ flours: scaledFlours })
    }
  }

  return <></>
}

const App = () => {
  const { t } = useTranslation()

  const [results, setResults] = useState(null)
  const [form] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)
  const [doughType, setDoughType] = useState("sourdough")
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedTemperatureUnit, setSelectedTemperatureUnit] =
    useState("celsius")

  const milkTypeMap = {
    [t("Whole Milk")]: "whole",
    [t("Skim Milk")]: "skim",
    [t("Almond Milk")]: "almond",
    [t("Soy Milk")]: "soy",
    [t("Oat Milk")]: "oat",
  }

  const fatTypeMap = {
    [t("Butter")]: "butter",
    [t("Oil")]: "oil",
    [t("Margarine")]: "margarine",
    [t("Lard")]: "lard",
  }

  const liquidTypeMap = {
    [t("Water")]: "water",
    [t("Whole Milk")]: "whole-milk",
    [t("Skim Milk")]: "skim-milk",
    [t("Almond Milk")]: "almond-milk",
    [t("Soy Milk")]: "soy-milk",
  }

  const yogurtTypeMap = {
    [t("No Yogurt")]: "no-yogurt",
    [t("Full Fat Yogurt")]: "full-fat",
    [t("Low Fat Yogurt")]: "low-fat",
    [t("Non Fat Yogurt")]: "non-fat",
  }

  const handleModalOk = () => {
    setModalVisible(false)
    setResults(null)
    form.resetFields()
  }

  const handleModalCancel = () => {
    setModalVisible(false)
  }

  const handleDoughTypeChange = (type) => {
    setDoughType(type)
    form.resetFields()
  }

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
    setDrawerVisible(false)
  }

  const onFinish = (values) => {
    console.log("Values = ", values)

    let temperature = values.temperature
    if (values.temperatureUnit === "fahrenheit") {
      temperature = fahrenheitToCelsius(temperature)
    }

    const mappedValues = {
      ...values,
      temperature,
    }
    switch (doughType) {
      case "sourdough":
        calculateDough(mappedValues, setResults, setModalVisible)
        break
      case "pizza":
        calculatePizza(mappedValues, setResults, setModalVisible)
        break
      case "focaccia":
        calculateFocaccia(mappedValues, setResults, setModalVisible)
        break
      case "brioche":
        const mappedValuesBrioche = {
          ...mappedValues,
          milkType: milkTypeMap[mappedValues.milkType],
          fatType: fatTypeMap[mappedValues.fatType],
        }
        calculateBrioche(mappedValuesBrioche, setResults, setModalVisible)
        break
      case "naan":
        const mappedValuesNaan = {
          ...mappedValues,
          liquidType: liquidTypeMap[mappedValues.liquidType],
          yogurtType: yogurtTypeMap[mappedValues.yogurtType],
        }
        calculateNaan(mappedValuesNaan, setResults, setModalVisible)
        break
      default:
        console.error("Invalid dough type")
    }
  }

  return (
    <Layout>
      <Header
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 140,
          position: "relative",
        }}
      >
        <Title
          className="title"
          style={{ color: "white", textAlign: "center" }}
        >
          {t("Bread Calculator")}
        </Title>
        <div
          style={{
            position: "absolute",
            right: "20px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <LanguageSelector
            changeLanguage={changeLanguage}
            setDrawerVisible={setDrawerVisible}
            drawerVisible={drawerVisible}
          />
        </div>
      </Header>
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          width: "100%",
        }}
      >
        <DoughTypeSelector
          doughType={doughType}
          handleDoughTypeChange={handleDoughTypeChange}
        />
        <div className="container">
          <div className="form-box">
            <Form
              layout="vertical"
              form={form}
              onFinish={onFinish}
              initialValues={{
                flours: [
                  {
                    flourKind: undefined,
                    flourAmount: 0,
                    proteinContent: 0,
                    fiberContent: 0,
                  },
                ],
              }}
            >
              {doughType === "sourdough" ? (
                <FlourForm form={form} t={t} />
              ) : null}
              {doughType === "focaccia" ? <FocacciaForm t={t} /> : null}
              {doughType === "brioche" ? <BriocheForm t={t} /> : null}
              {doughType === "naan" ? <NaanForm t={t} /> : null}
              {doughType === "pizza" ? <PizzaForm form={form} t={t} /> : null}
              {doughType !== "brioche" && doughType !== "naan" && (
                <Form.Item name="coldProofing" valuePropName="checked">
                  <Checkbox>{t("Second proofing in refrigerator")}</Checkbox>
                </Form.Item>
              )}
              <Form.Item name="temperatureUnit" label={t("Temperature Unit")}>
                <Select
                  onChange={(value) => {
                    setSelectedTemperatureUnit(value)
                  }}
                  defaultValue="celsius"
                >
                  <Option value="celsius">°C</Option>
                  <Option value="fahrenheit">°F</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="temperature"
                label={t("Room temperature")}
                rules={[
                  {
                    required: true,
                    message: t("Insert your room temperature"),
                  },
                ]}
                initialValue={selectedTemperatureUnit === "celsius" ? 20 : 68}
              >
                <InputNumber
                  datatype="number"
                  min={
                    form.getFieldValue("temperatureUnit") === "celsius"
                      ? -10
                      : 14
                  }
                  max={
                    form.getFieldValue("temperatureUnit") === "celsius"
                      ? 50
                      : 122
                  }
                  placeholder={t("Insert your room temperature")}
                  style={{ width: 200 }}
                  addonAfter={
                    selectedTemperatureUnit === "celsius" ? "°C" : "°F"
                  }
                />
              </Form.Item>
              <ScaleRecipe form={form} t={t} doughType={doughType} />
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  {t("Calculate")}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Bread Calculator - Macco di Favole 2024
      </Footer>
      <ResultsModal
        modalVisible={modalVisible}
        handleModalOk={handleModalOk}
        handleModalCancel={handleModalCancel}
        results={results}
        doughType={doughType}
        t={t}
      />
    </Layout>
  )
}

export default App
