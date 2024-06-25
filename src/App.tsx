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
  List,
  Input,
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
import { calculatePita } from "./utils/calculatePita"

const { Header, Content, Footer } = Layout
const { Title } = Typography
const { Option } = Select

interface Recipe {
  name: string
  recipe: any
  doughType: string
  isExpertMode: boolean
}

interface ExampleRecipe {
  flours?: Array<{
    flourKind: string
    proteinContent?: number
    fiberContent: number
    flourAmount: number
    flourPercentage?: number
  }>
  coldProofing?: boolean
  temperature: number
  temperatureUnit: string
  numberOfPizzas?: number
  weightPerPizza?: number
  flourAmount?: number
  proteinContent?: number
  fiberContent?: number
  hydrationPercentage?: number
  fatPercentage?: number
  fatType?: string
  includeEggs?: boolean
  milkType?: string
  briocheWeight?: number
  bunCount?: number
  naanCount?: number
  yogurtType?: string
  liquidType?: string
  naanWeight?: number
  pitaCount?: number
  pitaWeight?: number
}

const saveRecipe = (
  recipe: any,
  name: string,
  doughType: string,
  isExpertMode: boolean
) => {
  let savedRecipes = JSON.parse(localStorage.getItem("savedRecipes") || "[]")
  savedRecipes.push({ name, recipe, doughType, isExpertMode })
  localStorage.setItem("savedRecipes", JSON.stringify(savedRecipes))
}

const loadSavedRecipes = (): Recipe[] => {
  return JSON.parse(localStorage.getItem("savedRecipes") || "[]")
}

const deleteRecipe = (recipeName: string) => {
  let savedRecipes = JSON.parse(localStorage.getItem("savedRecipes") || "[]")
  savedRecipes = savedRecipes.filter(
    (recipe: Recipe) => recipe.name !== recipeName
  )
  localStorage.setItem("savedRecipes", JSON.stringify(savedRecipes))
}

const exampleRecipes: { [key: string]: ExampleRecipe } = {
  sourdough: {
    flours: [
      {
        flourKind: "grano tenero",
        proteinContent: 12,
        fiberContent: 2,
        flourAmount: 400,
      },
      {
        flourKind: "farina di segale",
        proteinContent: 9,
        fiberContent: 15,
        flourAmount: 100,
      },
    ],
    coldProofing: true,
    temperature: 20,
    temperatureUnit: "celsius",
  },
  pizza: {
    numberOfPizzas: 4,
    weightPerPizza: 250,
    flours: [
      {
        flourKind: "grano tenero",
        proteinContent: 13,
        fiberContent: 2,
        flourPercentage: 80,
        flourAmount: 400,
      },
      {
        flourKind: "grano duro",
        proteinContent: 12,
        fiberContent: 3,
        flourPercentage: 20,
        flourAmount: 100,
      },
    ],
    temperature: 20,
    temperatureUnit: "celsius",
  },
  focaccia: {
    flourAmount: 500,
    proteinContent: 11,
    fiberContent: 2,
    coldProofing: false,
    temperature: 22,
    temperatureUnit: "celsius",
  },
  brioche: {
    briocheWeight: 80,
    bunCount: 8,
    hydrationPercentage: 60,
    fatPercentage: 25,
    fatType: "Butter",
    includeEggs: true,
    milkType: "Whole Milk",
    temperature: 21,
    temperatureUnit: "celsius",
  },
  naan: {
    naanCount: 6,
    hydrationPercentage: 65,
    fatPercentage: 10,
    yogurtType: "Full Fat Yogurt",
    liquidType: "Water",
    naanWeight: 100,
    temperature: 23,
    temperatureUnit: "celsius",
  },
  pita: {
    pitaCount: 8,
    hydrationPercentage: 70,
    pitaWeight: 80,
    temperature: 22,
    temperatureUnit: "celsius",
  },
}

const celsiusToFahrenheit = (celsius: number) => {
  return (celsius * 9) / 5 + 32
}

const fahrenheitToCelsius = (fahrenheit: number) => {
  return ((fahrenheit - 32) * 5) / 9
}

const prepareChartData = (results: any, doughType: string) => {
  const parseAmount = (value: any) => {
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
  } else if (doughType === "pita") {
    data.push(
      { name: "Water", amount: parseAmount(results.totalWater) },
      { name: "Oil", amount: parseAmount(results.totalOil) }
    )
  } else {
    data.push({ name: "Water", amount: parseAmount(results.totalWater) })
  }

  return data.filter((item) => !isNaN(item.amount) && item.amount > 0)
}

interface LanguageSelectorProps {
  changeLanguage: (lng: string) => void
  setDrawerVisible: (visible: boolean) => void
  drawerVisible: boolean
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  changeLanguage,
  setDrawerVisible,
  drawerVisible,
}) => {
  const { t, i18n } = useTranslation()

  useEffect(() => {
    const detectedLanguage = i18n.language
    const supportedLanguages = ["en", "fr", "es", "it", "pt", "de"]

    if (supportedLanguages.includes(detectedLanguage)) {
      i18n.changeLanguage(detectedLanguage)
    } else {
      i18n.changeLanguage("en")
    }
  }, [i18n])

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
          open={drawerVisible}
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

interface DoughTypeSelectorProps {
  doughType: string
  handleDoughTypeChange: (type: string) => void
}

const DoughTypeSelector: React.FC<DoughTypeSelectorProps> = ({
  doughType,
  handleDoughTypeChange,
}) => {
  const { t } = useTranslation()
  return (
    <Radio.Group
      onChange={(e) => handleDoughTypeChange(e.target.value)}
      value={doughType}
      className="radio-group"
      style={{ marginBottom: 20, marginTop: 20 }}
    >
      <Radio.Button style={{ borderRadius: 0 }} value="sourdough">
        {t("Sourdough Bread")}
      </Radio.Button>
      <Radio.Button style={{ borderRadius: 0 }} value="pizza">
        {t("Pizza")}
      </Radio.Button>
      <Radio.Button style={{ borderRadius: 0 }} value="focaccia">
        {t("Focaccia")}
      </Radio.Button>
      <Radio.Button style={{ borderRadius: 0 }} value="brioche">
        {t("Brioche Buns")}
      </Radio.Button>
      <Radio.Button style={{ borderRadius: 0 }} value="naan">
        {t("Naan")}
      </Radio.Button>
      <Radio.Button style={{ borderRadius: 0 }} value="pita">
        {t("Pita")}
      </Radio.Button>
    </Radio.Group>
  )
}

interface FlourFormProps {
  form: any
  t: any
}

const FlourForm: React.FC<FlourFormProps> = ({ form, t }) => (
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
                  inputMode="numeric"
                  keyboard
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
                  inputMode="numeric"
                  keyboard
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
                  inputMode="numeric"
                  keyboard
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

interface FocacciaFormProps {
  t: any
}

const FocacciaForm: React.FC<FocacciaFormProps> = ({ t }) => (
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
          inputMode="numeric"
          keyboard
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
          inputMode="numeric"
          keyboard
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
          inputMode="numeric"
          keyboard
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

interface BriocheFormProps {
  isExpertMode: boolean
  t: any
  form: any
}

const BriocheForm: React.FC<BriocheFormProps> = ({ isExpertMode, t }) => {
  const [expertMode, setExpertMode] = useState(isExpertMode)

  return (
    <div className="flour-box">
      <Space direction="vertical" style={{ width: "100%" }}>
        <Form.Item name="expertMode" valuePropName="checked">
          <Checkbox onChange={(e) => setExpertMode(e.target.checked)}>
            {t("Expert Mode")}
          </Checkbox>
        </Form.Item>

        <Form.Item
          name="bunCount"
          label={t("Number of buns")}
          rules={[
            { required: true, message: t("Please input number of buns") },
          ]}
        >
          <InputNumber
            inputMode="numeric"
            keyboard
            datatype="number"
            min={0}
            style={{ width: "100%" }}
          />
        </Form.Item>
        {expertMode && (
          <>
            <Form.Item
              name="briocheWeight"
              label={t("Desired weight of each bun (g)")}
              initialValue={80}
              rules={[
                {
                  required: true,
                  message: t("Please input weight of each bun"),
                },
              ]}
            >
              <InputNumber
                inputMode="numeric"
                keyboard
                datatype="number"
                addonAfter="g"
                min={0}
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="proteinContent"
              label={t("Protein Content")}
              initialValue={10}
              rules={[
                { required: true, message: t("Please input protein content") },
              ]}
            >
              <InputNumber
                inputMode="numeric"
                keyboard
                datatype="number"
                min={0}
                max={100}
                addonAfter="%"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="fiberContent"
              label={t("Fiber Content")}
              initialValue={2}
              rules={[
                { required: true, message: t("Please input fiber content") },
              ]}
            >
              <InputNumber
                inputMode="numeric"
                keyboard
                datatype="number"
                min={0}
                max={100}
                addonAfter="%"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="hydrationPercentage"
              label={t("Hydration percentage")}
              initialValue={65}
              rules={[
                {
                  required: true,
                  message: t("Please input hydration percentage"),
                },
              ]}
            >
              <InputNumber
                inputMode="numeric"
                keyboard
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
              rules={[
                { required: true, message: t("Please input fat percentage") },
              ]}
            >
              <InputNumber
                inputMode="numeric"
                keyboard
                datatype="number"
                min={0}
                max={100}
                style={{ width: "100%" }}
                addonAfter="%"
              />
            </Form.Item>
          </>
        )}
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
}

interface NaanFormProps {
  isExpertMode: boolean
  t: any
  form: any
}

const NaanForm: React.FC<NaanFormProps> = ({ isExpertMode, t }) => {
  const [expertMode, setExpertMode] = useState(isExpertMode)

  return (
    <div className="flour-box">
      <Space direction="vertical" style={{ width: "100%" }}>
        <Form.Item name="expertMode" valuePropName="checked">
          <Checkbox onChange={(e) => setExpertMode(e.target.checked)}>
            {t("Expert Mode")}
          </Checkbox>
        </Form.Item>
        <Form.Item
          name="naanCount"
          label={t("Number of Naans")}
          rules={[
            { required: true, message: t("Please input number of naans") },
          ]}
        >
          <InputNumber
            inputMode="numeric"
            keyboard
            datatype="number"
            min={0}
            style={{ width: "100%" }}
          />
        </Form.Item>
        {expertMode && (
          <>
            <Form.Item
              name="naanWeight"
              label={t("Desired weight of each naan (g)")}
              initialValue={100}
            >
              <InputNumber
                inputMode="numeric"
                keyboard
                datatype="number"
                addonAfter="g"
                min={0}
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="proteinContent"
              label={t("Protein Content")}
              initialValue={10}
              rules={[
                { required: true, message: t("Please input protein content") },
              ]}
            >
              <InputNumber
                inputMode="numeric"
                keyboard
                datatype="number"
                min={0}
                max={100}
                addonAfter="%"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="fiberContent"
              label={t("Fiber Content")}
              initialValue={2}
              rules={[
                { required: true, message: t("Please input fiber content") },
              ]}
            >
              <InputNumber
                inputMode="numeric"
                keyboard
                datatype="number"
                min={0}
                max={100}
                addonAfter="%"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="hydrationPercentage"
              label={t("Hydration percentage")}
              initialValue={60}
              rules={[
                {
                  required: true,
                  message: t("Please input hydration percentage"),
                },
              ]}
            >
              <InputNumber
                inputMode="numeric"
                keyboard
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
              initialValue={10}
              rules={[
                { required: true, message: t("Please input fat percentage") },
              ]}
            >
              <InputNumber
                inputMode="numeric"
                keyboard
                datatype="number"
                min={0}
                max={100}
                style={{ width: "100%" }}
                addonAfter="%"
              />
            </Form.Item>
          </>
        )}
        <Form.Item
          name="yogurtType"
          label={t("Yogurt Type")}
          style={{ width: 200 }}
          rules={[{ required: true, message: t("Please select yogurt type") }]}
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
          rules={[{ required: true, message: t("Please select liquid type") }]}
        >
          <Select style={{ width: 200 }}>
            <Option value={t("Water")}>{t("Water")}</Option>
            <Option value={t("Whole Milk")}>{t("Whole Milk")}</Option>
            <Option value={t("Skim Milk")}>{t("Skim Milk")}</Option>
            <Option value={t("Almond Milk")}>{t("Almond Milk")}</Option>
            <Option value={t("Soy Milk")}>{t("Soy Milk")}</Option>
          </Select>
        </Form.Item>
      </Space>
    </div>
  )
}

interface PitaFormProps {
  isExpertMode: boolean
  t: any
  form: any
}

const PitaForm: React.FC<PitaFormProps> = ({ isExpertMode, t }) => {
  const [expertMode, setExpertMode] = useState(isExpertMode)

  return (
    <div className="flour-box">
      <Space direction="vertical" style={{ width: "100%" }}>
        <Form.Item name="expertMode" valuePropName="checked">
          <Checkbox onChange={(e) => setExpertMode(e.target.checked)}>
            {t("Expert Mode")}
          </Checkbox>
        </Form.Item>
        <Form.Item
          name="pitaCount"
          label={t("Number of Pitas")}
          rules={[
            { required: true, message: t("Please input number of pitas") },
          ]}
        >
          <InputNumber
            inputMode="numeric"
            keyboard
            datatype="number"
            min={0}
            style={{ width: "100%" }}
          />
        </Form.Item>
        {expertMode && (
          <>
            <Form.Item
              name="pitaWeight"
              label={t("Desired weight of each pita (g)")}
              initialValue={80}
            >
              <InputNumber
                inputMode="numeric"
                keyboard
                datatype="number"
                addonAfter="g"
                min={0}
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="proteinContent"
              label={t("Protein Content")}
              initialValue={10}
              rules={[
                { required: true, message: t("Please input protein content") },
              ]}
            >
              <InputNumber
                inputMode="numeric"
                keyboard
                datatype="number"
                min={0}
                max={100}
                addonAfter="%"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="fiberContent"
              label={t("Fiber Content")}
              initialValue={2}
              rules={[
                { required: true, message: t("Please input fiber content") },
              ]}
            >
              <InputNumber
                inputMode="numeric"
                keyboard
                datatype="number"
                min={0}
                max={100}
                addonAfter="%"
                style={{ width: "100%" }}
              />
            </Form.Item>
            <Form.Item
              name="hydrationPercentage"
              label={t("Hydration percentage")}
              initialValue={65}
              rules={[
                {
                  required: true,
                  message: t("Please input hydration percentage"),
                },
              ]}
            >
              <InputNumber
                inputMode="numeric"
                keyboard
                datatype="number"
                min={0}
                max={100}
                style={{ width: "100%" }}
                addonAfter="%"
              />
            </Form.Item>
          </>
        )}
      </Space>
    </div>
  )
}

interface PizzaFormProps {
  form: any
  t: any
  doughType: string
}

const PizzaForm: React.FC<PizzaFormProps> = ({ form, t, doughType }) => {
  const [sliderValues, setSliderValues] = useState<number[]>([])
  const flours = Form.useWatch("flours", form) || []

  useEffect(() => {
    if (flours.length !== sliderValues.length) {
      setSliderValues(flours.map((flour: any) => flour.flourPercentage || 0))
    } else {
      setSliderValues(
        flours.map((flour: any, index: number) => {
          return typeof sliderValues[index] === "undefined"
            ? 0
            : sliderValues[index]
        })
      )
    }
  }, [flours])

  useEffect(() => {
    if (flours.length > 0 && doughType === "pizza") {
      const updatedFlours = flours.map((flour: any, index: number) => ({
        ...flour,
        flourPercentage: index === 0 ? 100 : 0,
      }))
      form.setFieldsValue({ flours: updatedFlours })
      setSliderValues(updatedFlours.map((flour: any) => flour.flourPercentage))
    }
  }, [doughType])

  const updatePercentages = (index: number, newValue: number) => {
    const currentFlours = form.getFieldValue("flours") || []
    if (currentFlours.length === 0) return

    let totalOthers = currentFlours.reduce(
      (sum: number, flour: any, i: number) =>
        i !== index ? sum + (flour?.flourPercentage || 0) : sum,
      0
    )

    if (totalOthers === 0) {
      const remainingPercentage = 100 - newValue
      const otherFlourCount = currentFlours.length - 1
      const equalShare = remainingPercentage / otherFlourCount

      const updatedFlours = currentFlours.map((flour: any, i: number) => {
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

      const updatedFlours = currentFlours.map((flour: any, i: number) => {
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

  const handleSliderChange = (index: number, newValue: number) => {
    const newSliderValues = [...sliderValues]
    newSliderValues[index] = newValue
    setSliderValues(newSliderValues)
    updatePercentages(index, newValue)
  }

  const isGlutenFree = (flourKind: string) =>
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
        <InputNumber
          inputMode="numeric"
          keyboard
          datatype="number"
          min={1}
          style={{ width: "100%" }}
        />
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
          inputMode="numeric"
          keyboard
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
            validator: async (_: any, flours: any) => {
              if (!flours || flours.length < 1) {
                return Promise.reject(
                  new Error(t("At least one type of flour is required"))
                )
              }
              const totalPercentage = flours.reduce(
                (sum: number, flour: any) =>
                  sum + (flour?.flourPercentage || 0),
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
                    label={t("Flour percentage")}
                  >
                    <Slider
                      min={0}
                      max={100}
                      value={sliderValues[index]}
                      onChange={(value) => handleSliderChange(index, value)}
                      style={{ width: 200 }}
                    />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, "proteinContent"]}
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
                      inputMode="numeric"
                      keyboard
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
                    label={t("Fiber Content")}
                    rules={[
                      {
                        required: true,
                        message: t("Insert your flour fiber content"),
                      },
                    ]}
                  >
                    <InputNumber
                      inputMode="numeric"
                      keyboard
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
                          .filter((_: any, i: number) => i !== index)
                        const equalPercentage = 100 / newFlours.length
                        const updatedFlours = newFlours.map((flour: any) => ({
                          ...flour,
                          flourPercentage: equalPercentage,
                        }))
                        form.setFieldsValue({ flours: updatedFlours })
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
                  const equalPercentage = 100 / newFlours.length
                  const updatedFlours = newFlours.map((flour: any) => ({
                    ...flour,
                    flourPercentage: equalPercentage,
                  }))
                  form.setFieldsValue({ flours: updatedFlours })
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

interface ResultsModalProps {
  modalVisible: boolean
  handleModalOk: () => void
  handleModalCancel: () => void
  results: any
  doughType: string
  t: any
}

const ResultsModal: React.FC<ResultsModalProps> = ({
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
              <Alert
                message={`${t("Adjusted Hydration")}: ${
                  results.adjustedHydration
                }%`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Protein Content")}: ${results.proteinContent}%`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Fiber Content")}: ${results.fiberContent}%`}
                type="info"
                showIcon
              />
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
              <Alert
                message={`${t("Adjusted Hydration")}: ${
                  results.adjustedHydration
                }%`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Protein Content")}: ${results.proteinContent}%`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Fiber Content")}: ${results.fiberContent}%`}
                type="info"
                showIcon
              />
            </>
          ) : doughType === "pita" ? (
            <>
              <Alert
                message={`${t("Water")}: ${results.totalWater} g`}
                type="info"
                showIcon
              />
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
                message={`${t("Oil")}: ${results.totalOil} g`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Proofing time")}: ${results.proofingTime}`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Number of pitas")} (${results.pitaWeight}g): ${
                  results.numberOfPitas
                }`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Adjusted Hydration")}: ${
                  results.adjustedHydration
                }%`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Protein Content")}: ${results.proteinContent}%`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Fiber Content")}: ${results.fiberContent}%`}
                type="info"
                showIcon
              />
              <Alert
                message={`${t("Total dough weight")}: ${
                  results.totalDoughWeight
                } g`}
                type="info"
                showIcon
              />
            </>
          ) : (
            <>
              {doughType === "pizza" &&
                results.flourComposition?.map((flour: any, index: number) => (
                  <Alert
                    key={index + "a"}
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

interface ScaleRecipeProps {
  form: any
  t: any
  doughType: string
}

const ScaleRecipe: React.FC<ScaleRecipeProps> = ({ form, t, doughType }) => {
  const scaleRecipe = () => {
    const targetFlourWeight = form.getFieldValue("targetFlourWeight")
    if (!targetFlourWeight) return

    const currentValues = form.getFieldsValue()
    let currentTotalFlour = 0

    if (doughType === "focaccia") {
      currentTotalFlour = currentValues.flourAmount
    } else {
      currentTotalFlour = currentValues.flours.reduce(
        (sum: number, flour: any) => sum + flour.flourAmount,
        0
      )
    }

    const scaleFactor = targetFlourWeight / currentTotalFlour

    if (doughType === "focaccia") {
      form.setFieldsValue({
        flourAmount: Math.round(currentValues.flourAmount * scaleFactor),
      })
    } else {
      const scaledFlours = currentValues.flours.map((flour: any) => ({
        ...flour,
        flourAmount: Math.round(flour.flourAmount * scaleFactor),
      }))
      form.setFieldsValue({ flours: scaledFlours })
    }
  }

  return <></>
}

interface SavedRecipesModalProps {
  visible: boolean
  onClose: () => void
  onLoadRecipe: (item: Recipe) => void
  t: any
}

const SavedRecipesModal: React.FC<SavedRecipesModalProps> = ({
  visible,
  onClose,
  onLoadRecipe,
  t,
}) => {
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null)

  useEffect(() => {
    if (visible) {
      setSavedRecipes(loadSavedRecipes())
    }
  }, [visible])

  const handleDeleteClick = (recipe: Recipe) => {
    setRecipeToDelete(recipe)
    setDeleteModalVisible(true)
  }

  const handleDeleteConfirm = () => {
    if (recipeToDelete) {
      deleteRecipe(recipeToDelete.name)
      setSavedRecipes(loadSavedRecipes())
      setDeleteModalVisible(false)
      setRecipeToDelete(null)
    }
  }

  return (
    <>
      <Modal
        title={t("My Recipes")}
        open={visible}
        onCancel={onClose}
        footer={null}
      >
        <List
          dataSource={savedRecipes}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button onClick={() => onLoadRecipe(item)}>{t("Load")}</Button>,
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteClick(item)}
                  danger
                />,
              ]}
            >
              {item.name}
            </List.Item>
          )}
        />
      </Modal>
      <Modal
        title={t("Confirm Deletion")}
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModalVisible(false)}
        okText={t("Delete")}
        cancelText={t("Cancel")}
      >
        <p>{t("Are you sure you want to delete this recipe?")}</p>
      </Modal>
    </>
  )
}

interface SaveRecipeModalProps {
  visible: boolean
  onClose: () => void
  onSave: (name: string) => void
  t: any
}

const SaveRecipeModal: React.FC<SaveRecipeModalProps> = ({
  visible,
  onClose,
  onSave,
  t,
}) => {
  const [recipeName, setRecipeName] = useState("")

  const handleSave = () => {
    if (recipeName.trim()) {
      onSave(recipeName)
      setRecipeName("")
      onClose()
    }
  }

  return (
    <Modal
      title={t("Save Recipe")}
      visible={visible}
      onCancel={onClose}
      onOk={handleSave}
      okText={t("Save")}
      cancelText={t("Cancel")}
    >
      <Input
        placeholder={t("Enter recipe name")}
        value={recipeName}
        onChange={(e) => setRecipeName(e.target.value)}
      />
    </Modal>
  )
}

const App: React.FC = () => {
  const { t } = useTranslation()

  const [results, setResults] = useState<any>(null)
  const [form] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)
  const [doughType, setDoughType] = useState("sourdough")
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedTemperatureUnit, setSelectedTemperatureUnit] =
    useState("celsius")
  const [savedRecipesModalVisible, setSavedRecipesModalVisible] =
    useState(false)
  const [saveRecipeModalVisible, setSaveRecipeModalVisible] = useState(false)
  const [isExpertMode, setIsExpertMode] = useState(false)
  const [validationModalVisible, setValidationModalVisible] = useState(false)

  const validateFormBeforeSave = async () => {
    try {
      await form.validateFields()
      return true
    } catch (error) {
      return false
    }
  }

  const handleSaveRecipe = (name: string) => {
    const currentValues = form.getFieldsValue()
    const isExpertMode = currentValues.expertMode
    saveRecipe(currentValues, name, doughType, isExpertMode)
    setSaveRecipeModalVisible(false)
  }

  const handleSaveRecipeClick = async () => {
    const isFormValid = await validateFormBeforeSave()
    if (isFormValid) {
      setSaveRecipeModalVisible(true)
    } else {
      setValidationModalVisible(true)
    }
  }

  const fillExampleRecipe = () => {
    const example = exampleRecipes[doughType]
    if (example) {
      form.setFieldsValue(example)
      form.validateFields()
    } else {
      console.error(`No example recipe for dough type: ${doughType}`)
    }
  }

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

  const handleDoughTypeChange = (type: string) => {
    setDoughType(type)
    form.resetFields()
    if (type === "pizza") {
      form.setFieldsValue({
        flours: [{ flourPercentage: 100 }],
      })
    }
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    setDrawerVisible(false)
  }

  const onFinish = (values: any) => {
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
      case "pita":
        calculatePita(mappedValues, setResults, setModalVisible)
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
        <Button onClick={() => setSavedRecipesModalVisible(true)}>
          {t("My Recipes")}
        </Button>
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
              {doughType === "brioche" ? (
                <BriocheForm isExpertMode={isExpertMode} t={t} form={form} />
              ) : null}
              {doughType === "naan" ? (
                <NaanForm isExpertMode={isExpertMode} t={t} form={form} />
              ) : null}
              {doughType === "pizza" ? (
                <PizzaForm doughType={doughType} form={form} t={t} />
              ) : null}
              {doughType === "pita" ? (
                <PitaForm isExpertMode={isExpertMode} t={t} form={form} />
              ) : null}
              {doughType !== "brioche" &&
                doughType !== "naan" &&
                doughType !== "pita" && (
                  <Form.Item name="coldProofing" valuePropName="checked">
                    <Checkbox>{t("Second proofing in refrigerator")}</Checkbox>
                  </Form.Item>
                )}
              <Form.Item
                initialValue={"celsius"}
                name="temperatureUnit"
                label={t("Temperature Unit")}
              >
                <Select
                  onChange={(value) => {
                    setSelectedTemperatureUnit(value)
                  }}
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
                  inputMode="numeric"
                  keyboard
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
                <Button
                  onClick={async () => {
                    fillExampleRecipe()
                    await new Promise((r) => setTimeout(r, 5))
                    fillExampleRecipe()
                  }}
                  style={{ marginLeft: 10 }}
                >
                  {t("Show Example Recipe")}
                </Button>
                <Button
                  onClick={handleSaveRecipeClick}
                  style={{ marginLeft: 10 }}
                >
                  {t("Save Recipe")}
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
      <SavedRecipesModal
        visible={savedRecipesModalVisible}
        onClose={() => setSavedRecipesModalVisible(false)}
        onLoadRecipe={(item) => {
          setIsExpertMode(item.isExpertMode)
          setDoughType(item.doughType)
          form.resetFields()
          form.setFieldsValue(item.recipe)
          setSavedRecipesModalVisible(false)
        }}
        t={t}
      />
      <SaveRecipeModal
        visible={saveRecipeModalVisible}
        onClose={() => setSaveRecipeModalVisible(false)}
        onSave={handleSaveRecipe}
        t={t}
      />
      <Modal
        title={t("Validation Error")}
        open={validationModalVisible}
        onOk={() => setValidationModalVisible(false)}
        onCancel={() => setValidationModalVisible(false)}
        okText={t("OK")}
      >
        <p>{t("You must fill all fields before saving a recipe!")}</p>
      </Modal>
    </Layout>
  )
}

export default App
